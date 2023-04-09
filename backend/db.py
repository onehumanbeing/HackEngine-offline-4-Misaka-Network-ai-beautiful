import psycopg2

class DB:
    def __init__(self, dbname, user, password, host, port):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.conn = psycopg2.connect(
            dbname=self.dbname,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port
        )
        self.cursor = self.conn.cursor()

    def query(self, query, params=None):
        self.cursor.execute(query, params)
        results = self.cursor.fetchall()
        return results

    def insert(self, table, data):
        columns = ', '.join(data.keys())
        values = ', '.join(['%s' for _ in range(len(data))])
        query = f"INSERT INTO {table} ({columns}) VALUES ({values})"
        self.cursor.execute(query, tuple(data.values()))
        self.conn.commit()

    def __del__(self):
        self.cursor.close()
        self.conn.close()


database = DB(dbname="simple_cloth", user="sinkstars", password="demo", host="localhost", port="5432")

def similar_query(vector, limit=3):
    v = ", ".join( map(lambda x: str(x) , vector.tolist()[0]))
    sql = "SELECT id, sku_name FROM items ORDER BY embedding <-> '[%s]' LIMIT %d;" % (v, limit)
    results = database.query(sql)
    res = list()
    for cell in results:
        res.append({"id": cell[0], "name": cell[1]})
    return res

