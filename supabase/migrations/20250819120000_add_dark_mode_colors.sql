-- Migration to add dark mode specific colors to global_ui_themes table
-- This allows themes to have different colors for light and dark mode

-- Add dark mode specific background and surface colors
ALTER TABLE global_ui_themes 
ADD COLUMN background_color_dark CHARACTER VARYING(20) DEFAULT '222 18% 4%',
ADD COLUMN foreground_color_dark CHARACTER VARYING(20) DEFAULT '0 0% 100%',
ADD COLUMN card_color_dark CHARACTER VARYING(20) DEFAULT '215 8% 12%',
ADD COLUMN card_foreground_dark CHARACTER VARYING(20) DEFAULT '0 0% 100%',
ADD COLUMN border_color_dark CHARACTER VARYING(20) DEFAULT '215 10% 22%',
ADD COLUMN input_color_dark CHARACTER VARYING(20) DEFAULT '215 10% 22%',
ADD COLUMN muted_color_dark CHARACTER VARYING(20) DEFAULT '215 12% 16%',
ADD COLUMN muted_foreground_dark CHARACTER VARYING(20) DEFAULT '215 20% 65%',
ADD COLUMN popover_color_dark CHARACTER VARYING(20) DEFAULT '222 13% 11%',
ADD COLUMN popover_foreground_dark CHARACTER VARYING(20) DEFAULT '0 0% 100%';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_global_ui_themes_background_dark ON global_ui_themes(background_color_dark);
CREATE INDEX IF NOT EXISTS idx_global_ui_themes_card_dark ON global_ui_themes(card_color_dark);

-- Update existing UI Nativa theme with proper dark mode colors
UPDATE global_ui_themes 
SET 
  background_color_dark = '222 18% 4%',
  foreground_color_dark = '0 0% 100%',
  card_color_dark = '215 8% 12%', 
  card_foreground_dark = '0 0% 100%',
  border_color_dark = '215 10% 22%',
  input_color_dark = '215 10% 22%',
  muted_color_dark = '215 12% 16%',
  muted_foreground_dark = '215 20% 65%',
  popover_color_dark = '222 13% 11%',
  popover_foreground_dark = '0 0% 100%'
WHERE name = 'ui_nativa';

-- Add comment explaining the new columns
COMMENT ON COLUMN global_ui_themes.background_color_dark IS 'Background color for dark mode';
COMMENT ON COLUMN global_ui_themes.foreground_color_dark IS 'Foreground/text color for dark mode';
COMMENT ON COLUMN global_ui_themes.card_color_dark IS 'Card background color for dark mode';
COMMENT ON COLUMN global_ui_themes.card_foreground_dark IS 'Card text color for dark mode';
COMMENT ON COLUMN global_ui_themes.border_color_dark IS 'Border color for dark mode';
COMMENT ON COLUMN global_ui_themes.input_color_dark IS 'Input field color for dark mode';
COMMENT ON COLUMN global_ui_themes.muted_color_dark IS 'Muted background color for dark mode';
COMMENT ON COLUMN global_ui_themes.muted_foreground_dark IS 'Muted text color for dark mode';
COMMENT ON COLUMN global_ui_themes.popover_color_dark IS 'Popover background color for dark mode';
COMMENT ON COLUMN global_ui_themes.popover_foreground_dark IS 'Popover text color for dark mode';