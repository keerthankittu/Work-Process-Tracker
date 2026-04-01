from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    username: str
    password: str
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "member"
    skills: str

class WorkItemCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    assignee_id: int
    status: str = "in-progress"
class DependencyCreate(BaseModel):
    predecessor_id: int
    successor_id: int
    type: str = "full"       # "full" or "partial"
    threshold: int = 100     # 1 to 100    
class WorkItemUpdate(BaseModel):
    progress: int    