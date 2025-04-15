CREATE TYPE "public"."alert_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('open', 'investigating', 'resolved', 'false_positive');--> statement-breakpoint
CREATE TYPE "public"."investment_status" AS ENUM('active', 'completed', 'cancelled', 'pending');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'paypal', 'crypto', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('retail', 'wholesale', 'digital', 'service');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'expired', 'completed', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'withdrawal', 'fee', 'bonus', 'investment', 'earning');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."vip_tier" AS ENUM('standard', 'bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'completed', 'rejected', 'canceled');--> statement-breakpoint
CREATE TABLE "fraud_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"description" text NOT NULL,
	"status" "alert_status" DEFAULT 'open',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"resolved_by" uuid
);
--> statement-breakpoint
CREATE TABLE "investment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"duration_hours" integer NOT NULL,
	"return_percentage" numeric(5, 2) NOT NULL,
	"min_amount" numeric(19, 4) NOT NULL,
	"max_amount" numeric(19, 4),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid,
	"amount" numeric(19, 4) NOT NULL,
	"expected_return" numeric(19, 4) NOT NULL,
	"actual_return" numeric(19, 4),
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"status" "investment_status" DEFAULT 'active',
	"is_reinvested" boolean DEFAULT false,
	"product_id" uuid
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"total_invested" numeric(19, 4) NOT NULL,
	"total_referrals" integer NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bonus" (
	"user_id" uuid NOT NULL,
	"status" "transaction_status" DEFAULT 'pending',
	"bonus_amount" numeric(19, 4) DEFAULT '50',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"type" varchar(50) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "passwords" (
	"id" uuid PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"reset_token_expires" integer,
	"last_changed" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"referral_code" text NOT NULL,
	"bonus_amount" numeric(19, 4) DEFAULT '50',
	"bonus_status" "transaction_status" DEFAULT 'pending',
	"is_self_referral" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone" varchar(256) NOT NULL,
	"status" "user_status" DEFAULT 'active',
	"balance" numeric(19, 4) DEFAULT '0',
	"two_factor_secret" text NOT NULL,
	"two_factor_secret_enable" boolean DEFAULT false,
	"vip_tier" "vip_tier",
	"code" varchar,
	"total_invested" numeric(19, 4) DEFAULT '0',
	"total_withdrawn" numeric(19, 4) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"last_login" timestamp,
	"profile_complete" boolean DEFAULT false,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"netAmount" numeric(19, 4) NOT NULL,
	"fee" numeric(19, 4) NOT NULL,
	"phone" varchar NOT NULL,
	"admin" text,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"process_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_plan_id_investment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."investment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus" ADD CONSTRAINT "bonus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passwords" ADD CONSTRAINT "passwords_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;