"""
Authentication Service - OAuth and user management using local SQLite
"""
import httpx
from typing import Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.core.database import SessionLocal, User


class AuthService:
    """
    Service for authentication operations using local SQLite database
    """
    
    def _get_db(self) -> Session:
        """Get database session"""
        return SessionLocal()
    
    def _get_or_create_user(self, db: Session, user_info: Dict) -> User:
        """Get existing user or create new one"""
        google_id = user_info["id"]
        
        # Check if user exists by Google ID first
        user = db.query(User).filter(User.id == google_id).first()
        
        if not user:
            # Also check by email for backwards compatibility
            user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if user:
            # Update user info in case name changed
            user.name = user_info["name"]
            user.avatar = user_info.get("avatar")
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
        else:
            # Create new user with Google ID as the primary key
            user = User(
                id=google_id,
                email=user_info["email"],
                name=user_info["name"],
                avatar=user_info.get("avatar"),
                provider="Google",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
    
    async def oauth_login(self, code: str, provider: str) -> Dict:
        """
        Handle OAuth login flow
        """
        if provider == "google":
            user_info = await self._google_oauth(code)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        
        # Get database session
        db = self._get_db()
        try:
            # Get or create user
            user = self._get_or_create_user(db, user_info)
            
            # Generate tokens
            token_data = {
                "sub": user.id,
                "email": user.email,
                "name": user.name or ""
            }
            
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            # Return with field names matching frontend expectations
            return {
                "token": access_token,
                "refreshToken": refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "avatar": user.avatar
                }
            }
        finally:
            db.close()
    
    async def _google_oauth(self, code: str) -> Dict:
        """
        Exchange Google OAuth code for user info
        """
        # The redirect_uri MUST match exactly what was used in the authorization request
        redirect_uri = f"{settings.FRONTEND_URL}/cryptoflow/auth/callback"
        
        async with httpx.AsyncClient() as client:
            # Exchange code for token
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            
            if token_response.status_code != 200:
                error_detail = token_response.json() if token_response.text else {}
                print(f"Google token exchange failed: {token_response.status_code} - {error_detail}")
                raise ValueError(f"Failed to exchange OAuth code: {error_detail.get('error_description', 'Unknown error')}")
            
            token_data = token_response.json()
            access_token = token_data["access_token"]
            
            # Get user info
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                print(f"Google userinfo failed: {user_response.status_code} - {user_response.text}")
                raise ValueError("Failed to get user info")
            
            user_data = user_response.json()
            
            return {
                "id": user_data["id"],  # Google's unique user ID
                "email": user_data["email"],
                "name": user_data.get("name", user_data["email"].split("@")[0]),
                "avatar": user_data.get("picture")
            }
    
    
    async def get_current_user(self, user_id: str) -> Optional[Dict]:
        """
        Get current user details
        """
        db = self._get_db()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "avatar": user.avatar,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                }
            return None
        finally:
            db.close()
    
    async def logout(self, user_id: str) -> bool:
        """
        Handle user logout (invalidate tokens if needed)
        """
        # Could implement token blacklisting here
        return True


# Global service instance
auth_service = AuthService()