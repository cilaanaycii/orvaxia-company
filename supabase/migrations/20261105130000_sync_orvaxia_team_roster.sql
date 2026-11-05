CREATE OR REPLACE FUNCTION public.sync_orvaxia_team_roster(p_roster jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, private, pg_temp
AS $$
DECLARE
  roster_member jsonb;
  member_name text;
  member_sort_order integer;
  existing_member_id uuid;
BEGIN
  IF NOT private.is_executive() THEN
    RAISE EXCEPTION 'Only active executives can synchronize the official team roster';
  END IF;

  IF p_roster IS NULL OR jsonb_typeof(p_roster) <> 'array' OR jsonb_array_length(p_roster) <> 31 THEN
    RAISE EXCEPTION 'The official team roster must contain exactly 31 members';
  END IF;

  FOR roster_member IN SELECT value FROM jsonb_array_elements(p_roster)
  LOOP
    member_name := NULLIF(trim(roster_member->>'name'), '');
    member_sort_order := (roster_member->>'sort_order')::integer;

    IF member_name IS NULL OR member_sort_order IS NULL OR member_sort_order NOT BETWEEN 1 AND 31 THEN
      RAISE EXCEPTION 'Invalid member name or sort order in official team roster';
    END IF;

    SELECT id INTO existing_member_id
    FROM public.team_members
    WHERE lower(name) = lower(member_name)
    LIMIT 1;

    IF FOUND THEN
      CONTINUE;
    END IF;

    SELECT member.id INTO existing_member_id
    FROM public.team_members AS member
    WHERE member.name ~* '^Nama Anggota([[:space:]]|$)'
      AND member.sort_order = member_sort_order
      AND NOT EXISTS (
        SELECT 1
        FROM public.performance_reviews AS review
        WHERE review.member_id = member.id
      )
    ORDER BY member.created_at, member.id
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
      SELECT member.id INTO existing_member_id
      FROM public.team_members AS member
      WHERE member.name ~* '^Nama Anggota([[:space:]]|$)'
        AND member.sort_order = 0
        AND NOT EXISTS (
          SELECT 1
          FROM public.performance_reviews AS review
          WHERE review.member_id = member.id
        )
      ORDER BY member.created_at, member.id
      LIMIT 1
      FOR UPDATE;
    END IF;

    IF FOUND THEN
      UPDATE public.team_members
      SET
        name = member_name,
        position = roster_member->>'position',
        division = roster_member->>'division',
        bio = COALESCE(roster_member->>'bio', ''),
        responsibilities = COALESCE(roster_member->'responsibilities', '[]'::jsonb),
        status = COALESCE(roster_member->>'status', 'Aktif'),
        avatar_url = COALESCE(roster_member->>'avatar_url', ''),
        phone = NULLIF(roster_member->>'phone', ''),
        email = NULLIF(roster_member->>'email', ''),
        sort_order = member_sort_order
      WHERE id = existing_member_id;
    ELSE
      INSERT INTO public.team_members (
        name,
        position,
        division,
        bio,
        responsibilities,
        status,
        avatar_url,
        phone,
        email,
        sort_order
      )
      VALUES (
        member_name,
        roster_member->>'position',
        roster_member->>'division',
        COALESCE(roster_member->>'bio', ''),
        COALESCE(roster_member->'responsibilities', '[]'::jsonb),
        COALESCE(roster_member->>'status', 'Aktif'),
        COALESCE(roster_member->>'avatar_url', ''),
        NULLIF(roster_member->>'phone', ''),
        NULLIF(roster_member->>'email', ''),
        member_sort_order
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_orvaxia_team_roster(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_orvaxia_team_roster(jsonb) TO authenticated;
