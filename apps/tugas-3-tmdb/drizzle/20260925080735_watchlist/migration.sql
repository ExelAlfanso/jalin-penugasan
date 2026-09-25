CREATE TABLE "watchlist" (
	"user_id" text,
	"movie_id" integer,
	"title" text NOT NULL,
	"poster_path" text,
	"release_date" text NOT NULL,
	"vote_average" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_pkey" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;