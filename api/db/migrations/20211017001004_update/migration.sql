-- DropIndex
DROP INDEX "file_storage_path_unique_constraint";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storage" TEXT NOT NULL,
    "path" TEXT,
    "title" TEXT,
    "b64_data" TEXT,
    "owner_id" TEXT NOT NULL DEFAULT '',
    FOREIGN KEY ("owner_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_File" ("createdAt", "id", "owner_id", "path", "storage", "title") SELECT "createdAt", "id", "owner_id", "path", "storage", "title" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
