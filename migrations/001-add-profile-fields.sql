BEGIN;
ALTER TABLE "user" ADD COLUMN displayName text;
ALTER TABLE "user" ADD COLUMN bio text;
ALTER TABLE "user" ADD COLUMN avatarUrl text;
ALTER TABLE "user" ADD COLUMN links text;
ALTER TABLE "user" ADD COLUMN theme text;
COMMIT;
