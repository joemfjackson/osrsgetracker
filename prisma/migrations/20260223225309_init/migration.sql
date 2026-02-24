-- CreateTable
CREATE TABLE "items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "examine" TEXT,
    "members" BOOLEAN NOT NULL DEFAULT false,
    "highalch" INTEGER,
    "ge_limit" INTEGER,
    "icon" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "price_snapshots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "high_price" INTEGER,
    "low_price" INTEGER,
    "high_volume" INTEGER,
    "low_volume" INTEGER,
    CONSTRAINT "price_snapshots_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "watchlist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "min_margin" INTEGER,
    "min_roi" REAL,
    "max_buy_price" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watchlist_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "price_snapshots_timestamp_idx" ON "price_snapshots"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "price_snapshots_item_id_timestamp_key" ON "price_snapshots"("item_id", "timestamp");
