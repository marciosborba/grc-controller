-- Corrigir avisos de segurança das funções adicionando search_path
CREATE OR REPLACE FUNCTION calculate_risk_level(impact_score integer, likelihood_score integer)
RETURNS text AS $$
BEGIN
  DECLARE
    risk_score integer := impact_score * likelihood_score;
  BEGIN
    CASE 
      WHEN risk_score >= 75 THEN RETURN 'Muito Alto';
      WHEN risk_score >= 50 THEN RETURN 'Alto';
      WHEN risk_score >= 25 THEN RETURN 'Médio';
      ELSE RETURN 'Baixo';
    END CASE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION auto_calculate_risk_level()
RETURNS trigger AS $$
BEGIN
  NEW.risk_level = calculate_risk_level(NEW.impact_score, NEW.likelihood_score);
  NEW.risk_score = NEW.impact_score * NEW.likelihood_score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';