import oracledb

conn = oracledb.connect(user="USER_ADMIN", password="admin123", dsn="localhost:1522/XEPDB1")
print(conn.version)
