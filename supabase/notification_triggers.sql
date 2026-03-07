-- ─────────────────────────────────────────────────────────────────────────────
-- AUTOMATIC NOTIFICATIONS — Database Triggers
-- NdreqeShpin Platform
-- Run in Supabase SQL Editor AFTER notifications_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. New offer → notify client ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id  UUID;
  v_app_title  TEXT;
  v_company    TEXT;
BEGIN
  -- Get application info
  SELECT client_id, title INTO v_client_id, v_app_title
  FROM applications WHERE id = NEW.application_id;

  -- Get company name
  SELECT business_name INTO v_company
  FROM companies WHERE id = NEW.company_id;

  IF v_client_id IS NOT NULL THEN
    PERFORM send_notification(
      v_client_id,
      '💼 Ofertë e re!',
      v_company || ' dërgoi ofertë €' || NEW.price::TEXT || ' për "' || COALESCE(v_app_title, 'aplikimin tuaj') || '"',
      'offer',
      '/client/applications'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_offer ON offers;
CREATE TRIGGER trg_notify_new_offer
  AFTER INSERT ON offers
  FOR EACH ROW EXECUTE FUNCTION notify_new_offer();


-- ── 2. Offer accepted → notify company ──────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_offer_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_company_profile UUID;
  v_app_title       TEXT;
  v_client_name     TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get application title
    SELECT a.title, p.full_name INTO v_app_title, v_client_name
    FROM applications a
    JOIN profiles p ON p.id = a.client_id
    WHERE a.id = NEW.application_id;

    -- Get company profile user
    SELECT p.id INTO v_company_profile
    FROM companies c
    JOIN profiles p ON p.id = c.id
    WHERE c.id = NEW.company_id;

    IF v_company_profile IS NOT NULL THEN
      PERFORM send_notification(
        v_company_profile,
        '✅ Oferta u pranua!',
        '"' || COALESCE(v_app_title, 'Aplikimi') || '" — klienti pranoi ofertën tuaj. Filloni bisedën!',
        'offer',
        '/company/offers'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_offer_accepted ON offers;
CREATE TRIGGER trg_notify_offer_accepted
  AFTER UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION notify_offer_accepted();


-- ── 3. New message → notify recipient ───────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_other_user UUID;
  v_sender     TEXT;
BEGIN
  -- Get the other participant in conversation
  SELECT 
    CASE WHEN c.user1_id = NEW.sender_id THEN c.user2_id ELSE c.user1_id END
  INTO v_other_user
  FROM conversations c WHERE c.id = NEW.conversation_id;

  -- Get sender name
  SELECT full_name INTO v_sender FROM profiles WHERE id = NEW.sender_id;

  IF v_other_user IS NOT NULL THEN
    PERFORM send_notification(
      v_other_user,
      '💬 Mesazh i ri',
      COALESCE(v_sender, 'Dikush') || ': ' || LEFT(NEW.content, 80) || CASE WHEN LENGTH(NEW.content) > 80 THEN '...' ELSE '' END,
      'message',
      '/messages'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_message ON messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();


-- ── 4. New review → notify reviewed user ────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
  v_reviewer TEXT;
BEGIN
  SELECT full_name INTO v_reviewer FROM profiles WHERE id = NEW.reviewer_id;

  PERFORM send_notification(
    NEW.reviewed_id,
    '⭐ Vlerësim i ri',
    COALESCE(v_reviewer, 'Dikush') || ' ju la ' || NEW.rating || '★ — "' || LEFT(COALESCE(NEW.comment, 'Vlerësim i mirë'), 60) || '"',
    'review',
    '/reviews'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_review ON reviews;
CREATE TRIGGER trg_notify_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION notify_new_review();


-- ── 5. New application in company city → notify matching companies ───────────
-- (Optional: notify companies when new application posted in their city)
CREATE OR REPLACE FUNCTION notify_companies_new_app()
RETURNS TRIGGER AS $$
DECLARE
  v_company_profile RECORD;
  v_client_name     TEXT;
BEGIN
  IF NEW.status = 'active' THEN
    SELECT full_name INTO v_client_name FROM profiles WHERE id = NEW.client_id;

    -- Notify verified companies in same city
    FOR v_company_profile IN
      SELECT p.id
      FROM companies c
      JOIN profiles p ON p.id = c.id
      WHERE c.city = NEW.city AND c.is_verified = true
      LIMIT 50
    LOOP
      PERFORM send_notification(
        v_company_profile.id,
        '📋 Aplikim i ri në ' || NEW.city,
        '"' || NEW.title || '" — Budget: €' || COALESCE(NEW.budget_max::TEXT, 'negociueshëm'),
        'system',
        '/company/applications'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_companies_new_app ON applications;
CREATE TRIGGER trg_notify_companies_new_app
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_companies_new_app();


-- ── 6. Welcome notification on signup ───────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_welcome()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'client' THEN
    PERFORM send_notification(NEW.id, '👋 Mirë se vini!', 'Postoni aplikimin tuaj të parë dhe merrni oferta brenda orëve.', 'system', '/client/applications/new');
  ELSIF NEW.role = 'company' THEN
    PERFORM send_notification(NEW.id, '👋 Mirë se vini!', 'Plotësoni profilin e biznesit tuaj dhe filloni të dërgoni oferta.', 'system', '/company/profile');
  ELSIF NEW.role = 'worker' THEN
    PERFORM send_notification(NEW.id, '👋 Mirë se vini!', 'Plotësoni profilin tuaj dhe gjeni punë pranë jush.', 'system', '/worker/profile');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_welcome ON profiles;
CREATE TRIGGER trg_notify_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_welcome();