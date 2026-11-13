CREATE TABLE IF NOT EXISTS users (
  id       TEXT PRIMARY KEY,
  nick     TEXT NOT NULL,
  nick_lc  TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL UNIQUE,
  banned   INTEGER NOT NULL DEFAULT 0,
  created  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS msgs (
  id     TEXT PRIMARY KEY,
  ch     TEXT NOT NULL,
  uid    TEXT NOT NULL,
  nick   TEXT NOT NULL,
  text   TEXT NOT NULL,
  ts     INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0,
  edited INTEGER,
  orig   TEXT
);
CREATE INDEX IF NOT EXISTS msgs_ch_ts ON msgs (ch, ts);
CREATE INDEX IF NOT EXISTS msgs_uid_ts ON msgs (uid, ts);
CREATE TABLE IF NOT EXISTS posts (
  id       TEXT PRIMARY KEY,
  uid      TEXT NOT NULL,
  nick     TEXT NOT NULL,
  kind     TEXT NOT NULL,
  cat      TEXT NOT NULL,
  caption  TEXT NOT NULL DEFAULT '',
  outfit   TEXT,
  progress TEXT,
  status   TEXT NOT NULL,
  hidden   INTEGER NOT NULL DEFAULT 0,
  ts       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_ts ON posts (ts);
CREATE TABLE IF NOT EXISTS imgs (
  id   TEXT PRIMARY KEY,
  data BLOB NOT NULL
);
CREATE TABLE IF NOT EXISTS reports (
  type TEXT NOT NULL,
  item TEXT NOT NULL,
  uid  TEXT NOT NULL,
  ts   INTEGER NOT NULL,
  PRIMARY KEY (type, item, uid)
);
CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS palin (
  id      TEXT PRIMARY KEY,
  host    TEXT NOT NULL,
  hnick   TEXT NOT NULL,
  guest   TEXT,
  gnick   TEXT,
  seed    INTEGER NOT NULL,
  status  TEXT NOT NULL,
  created INTEGER NOT NULL,
  started INTEGER,
  leaver  TEXT,
  hseen   INTEGER
);
CREATE INDEX IF NOT EXISTS palin_status ON palin (status, created);
CREATE TABLE IF NOT EXISTS palin_ans (
  match TEXT NOT NULL,
  round INTEGER NOT NULL,
  uid   TEXT NOT NULL,
  ok    INTEGER NOT NULL,
  ts    INTEGER NOT NULL,
  PRIMARY KEY (match, round, uid)
);
