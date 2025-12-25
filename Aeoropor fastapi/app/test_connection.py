import sys
sys.path.append('.')

from app.database import SessionLocal
from sqlalchemy import text  # Add this import

try:
    db = SessionLocal()
    # Wrap the SQL string with text()
    result = db.execute(text("SELECT 'Connected!' FROM dual")).fetchone()
    print(f"✅ SUCCESS: {result[0]}")
    db.close()
except Exception as e:
    print(f"❌ FAILED: {e}")
    print("\n🔧 Check:")
    print("1. Is Oracle database running?")
    print("2. Are .env credentials correct?")
    print("3. Can you connect with same credentials in SQL Developer?")