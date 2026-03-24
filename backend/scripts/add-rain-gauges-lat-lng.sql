-- Cadastro geoespacial: adiciona latitude e longitude aos pluviômetros.
-- Execute no banco: psql $DATABASE_URL -f scripts/add-rain-gauges-lat-lng.sql

ALTER TABLE rain_gauges
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMENT ON COLUMN rain_gauges.latitude IS 'Latitude do ponto de instalação do pluviômetro (WGS84)';
COMMENT ON COLUMN rain_gauges.longitude IS 'Longitude do ponto de instalação do pluviômetro (WGS84)';
