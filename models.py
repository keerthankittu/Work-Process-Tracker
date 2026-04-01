from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
import enum


class RoleType(str, enum.Enum):
    admin = "admin"
    member = "member"

class PriorityType(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class StatusType(str, enum.Enum):
    blocked = "blocked"
    in_progress = "in-progress"
    done = "done"

class DependencyType(str, enum.Enum):
    partial = "partial"
    full = "full"



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(SQLEnum(RoleType), default=RoleType.member)
   
    skills = Column(String) 

    assigned_tasks = relationship("WorkItem", back_populates="assignee")


class WorkItem(Base):
    __tablename__ = "work_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(SQLEnum(PriorityType), default=PriorityType.medium)
    progress = Column(Integer, default=0) # 0 to 100
    status = Column(SQLEnum(StatusType), default=StatusType.in_progress)
    
    
    assignee_id = Column(Integer, ForeignKey("users.id"))
    
    assignee = relationship("User", back_populates="assigned_tasks")

    blocking = relationship("Dependency", foreign_keys='Dependency.predecessor_id', back_populates="predecessor")
    blocked_by = relationship("Dependency", foreign_keys='Dependency.successor_id', back_populates="successor")


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, index=True)
    predecessor_id = Column(Integer, ForeignKey("work_items.id")) 
    successor_id = Column(Integer, ForeignKey("work_items.id"))   #
    type = Column(SQLEnum(DependencyType), default=DependencyType.full)
    threshold = Column(Integer, default=100) 

    predecessor = relationship("WorkItem", foreign_keys=[predecessor_id], back_populates="blocking")
    successor = relationship("WorkItem", foreign_keys=[successor_id], back_populates="blocked_by")