import oracledb

conn = oracledb.connect(user="USER_ADMIN", password="admin123", dsn="localhost:1521/XEPDB1")
print(conn.version)
