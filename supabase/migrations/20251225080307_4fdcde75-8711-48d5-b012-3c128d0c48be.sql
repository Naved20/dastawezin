-- Add columns to control document section visibility per service
ALTER TABLE public.services 
ADD COLUMN show_upload_section boolean DEFAULT true,
ADD COLUMN show_completed_section boolean DEFAULT true;