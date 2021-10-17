/*
  Warnings:

  - You are about to drop the column `b64_data` on the `File` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storage" TEXT NOT NULL,
    "path" TEXT,
    "title" TEXT,
    "extension" TEXT,
    "publicAllowed" BOOLEAN,
    "publicURL" TEXT,
    "publicURLExpires" DATETIME,
    "owner_id" TEXT NOT NULL DEFAULT '',
    FOREIGN KEY ("owner_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_File" ("createdAt", "extension", "id", "owner_id", "path", "storage", "title") SELECT "createdAt", "extension", "id", "owner_id", "path", "storage", "title" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
