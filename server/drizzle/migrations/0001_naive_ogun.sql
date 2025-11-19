ALTER TABLE "users" ADD COLUMN "otp" varchar(6) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_expiry_date" timestamp;