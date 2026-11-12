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
  hidden INTEGER NOT NULL DEFAULT 0
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
