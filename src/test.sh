export PGPASSWORD=Andrew
psql -h localhost -p 5432 -U rbarnes -d restaurant -c "SELECT * from recipes;"
