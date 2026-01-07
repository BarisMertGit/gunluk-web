import boto3
from botocore.client import Config
import tempfile
import os
from typing import Optional
from app.config import settings


class StorageService:
    """MinIO/S3 compatible storage service for video files."""
    
    def __init__(self):
        self.client = boto3.client(
            "s3",
            endpoint_url=f"http{'s' if settings.MINIO_SECURE else ''}://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1"
        )
        self.bucket = settings.MINIO_BUCKET
        self._ensure_bucket()
    
    def _ensure_bucket(self):
        """Create bucket if it doesn't exist."""
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except Exception:
            try:
                self.client.create_bucket(Bucket=self.bucket)
            except Exception as e:
                print(f"Could not create bucket: {e}")
    
    async def upload_file(self, key: str, data: bytes, content_type: str) -> str:
        """
        Upload file to storage.
        
        Args:
            key: Object key (path in bucket)
            data: File content as bytes
            content_type: MIME type
            
        Returns:
            Public URL of the uploaded file
        """
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=data,
            ContentType=content_type
        )
        
        # Generate URL
        url = f"http{'s' if settings.MINIO_SECURE else ''}://{settings.MINIO_ENDPOINT}/{self.bucket}/{key}"
        return url
    
    async def get_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Get a presigned URL for temporary access.
        
        Args:
            key: Object key
            expires_in: URL expiration time in seconds
            
        Returns:
            Presigned URL
        """
        url = self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in
        )
        return url
    
    async def download_to_temp(self, key: str) -> str:
        """
        Download file to a temporary location.
        
        Args:
            key: Object key
            
        Returns:
            Path to temporary file
        """
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        
        # Determine extension from key
        ext = key.split(".")[-1] if "." in key else "bin"
        
        # Create temp file
        fd, temp_path = tempfile.mkstemp(suffix=f".{ext}")
        with os.fdopen(fd, "wb") as f:
            f.write(response["Body"].read())
        
        return temp_path
    
    async def delete_file(self, key: str) -> bool:
        """
        Delete file from storage.
        
        Args:
            key: Object key
            
        Returns:
            True if deleted successfully
        """
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    async def list_files(self, prefix: str = "") -> list:
        """
        List files in storage.
        
        Args:
            prefix: Optional prefix to filter by
            
        Returns:
            List of object keys
        """
        response = self.client.list_objects_v2(
            Bucket=self.bucket,
            Prefix=prefix
        )
        
        return [obj["Key"] for obj in response.get("Contents", [])]
