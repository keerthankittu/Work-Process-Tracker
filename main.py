from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import engine, SessionLocal
import uvicorn
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Work Process Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_for_cycle(db: Session, predecessor_id: int, successor_id: int) -> bool:

    visited = set()
    stack = [successor_id]

    while stack:
        current_node = stack.pop()
        

        if current_node == predecessor_id:
            return True 

        if current_node not in visited:
            visited.add(current_node)
            

            downstream_deps = db.query(models.Dependency).filter(
                models.Dependency.predecessor_id == current_node
            ).all()
            
            for dep in downstream_deps:
                stack.append(dep.successor_id)

    return False

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    db_user = models.User(
        username=user.username, 
        hashed_password=user.password, 
        role=user.role, 
        skills=user.skills
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/work-items/")
def create_work_item(item: schemas.WorkItemCreate, db: Session = Depends(get_db)):
    
    user = db.query(models.User).filter(models.User.id == item.assignee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Assignee not found")

    db_item = models.WorkItem(
        title=item.title,
        description=item.description,
        priority=item.priority,
        assignee_id=item.assignee_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
@app.post("/dependencies/")
def create_dependency(dep: schemas.DependencyCreate, db: Session = Depends(get_db)):
   
    if dep.threshold <= 0:
        raise HTTPException(status_code=400, detail="Threshold must be greater than 0")

    
    if dep.predecessor_id == dep.successor_id:
        raise HTTPException(status_code=400, detail="A task cannot depend on itself")

   
    if check_for_cycle(db, dep.predecessor_id, dep.successor_id):
        raise HTTPException(
            status_code=400, 
            detail="Dependency rejected: This creates a circular dependency chain."
        )

    db_dep = models.Dependency(
        predecessor_id=dep.predecessor_id,
        successor_id=dep.successor_id,
        type=dep.type,
        threshold=dep.threshold
    )
    db.add(db_dep)
    db.commit()
    db.refresh(db_dep)
    return db_dep

@app.patch("/work-items/{item_id}")
def update_work_item(item_id: int, update_data: schemas.WorkItemUpdate, db: Session = Depends(get_db)):
   
    item = db.query(models.WorkItem).filter(models.WorkItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")

    if update_data.progress < 0 or update_data.progress > 100:
        raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")

    
    item.progress = update_data.progress
    if item.progress == 100:
        item.status = models.StatusType.done
    elif item.progress > 0 and item.status != models.StatusType.done:
        item.status = models.StatusType.in_progress
    
    db.commit()

 
    downstream_deps = db.query(models.Dependency).filter(
        models.Dependency.predecessor_id == item_id
    ).all()

    for dep in downstream_deps:
        successor = db.query(models.WorkItem).filter(
            models.WorkItem.id == dep.successor_id
        ).first()

       
        if successor and successor.status == models.StatusType.blocked:
            
           
            all_satisfied = True
            upstream_deps = db.query(models.Dependency).filter(
                models.Dependency.successor_id == successor.id
            ).all()

            for u_dep in upstream_deps:
                u_pred = db.query(models.WorkItem).filter(
                    models.WorkItem.id == u_dep.predecessor_id
                ).first()
                
                if u_dep.type == models.DependencyType.full and u_pred.progress < 100:
                    all_satisfied = False
                    break
                elif u_dep.type == models.DependencyType.partial and u_pred.progress < u_dep.threshold:
                    all_satisfied = False
                    break
            
          
            if all_satisfied:
                successor.status = models.StatusType.in_progress
                db.add(successor) # Stage the update

    db.commit()
    db.refresh(item)
    return item
@app.post("/login/")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {
        "id": db_user.id,
        "username": db_user.username,
        "role": db_user.role,
        "skills": db_user.skills
    }
@app.get("/users/")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@app.get("/work-items/{item_id}")
def get_work_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.WorkItem).filter(models.WorkItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    return item

@app.get("/work-items/")
def get_all_work_items(db: Session = Depends(get_db)):
    items = db.query(models.WorkItem).all()
    return items

@app.get("/dependencies/")
def get_all_dependencies(db: Session = Depends(get_db)):
    deps = db.query(models.Dependency).all()
    return deps

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)