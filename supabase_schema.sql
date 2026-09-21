-- ==============================================================================
-- DATABASE SCHEMA: WEBSITE LỚP 5/4 (2026-2027) - TRƯỜNG TIỂU HỌC LÊ VĂN TÁM
-- GVCN: PHAN THỊ DIỄM TRANG
-- NỀN TẢNG: SUPABASE (POSTGRESQL + AUTH + STORAGE + RLS)
-- ==============================================================================

-- 1. BẬT TIỆN ÍCH UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TẠO BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES - Liên kết auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
    phone TEXT,
    avatar_url TEXT,
    student_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TẠO BẢNG HỌC SINH LỚP 5/4 (STUDENTS)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    dob DATE,
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')) DEFAULT 'Nam',
    team_number INTEGER CHECK (team_number BETWEEN 1 AND 4) DEFAULT 1,
    role_in_class TEXT DEFAULT 'Học sinh',
    parent_name TEXT,
    parent_phone TEXT,
    address TEXT,
    avatar_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TẠO BẢNG DẶN DÒ & THÔNG BÁO (NOTICES)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject TEXT DEFAULT 'Chung',
    target_date DATE DEFAULT CURRENT_DATE NOT NULL,
    is_important BOOLEAN DEFAULT false NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'Cô Phan Thị Diễm Trang',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TẠO BẢNG XÁC NHẬN ĐÃ XEM DẶN DÒ (NOTICE_CONFIRMATIONS)
CREATE TABLE IF NOT EXISTS public.notice_confirmations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notice_id UUID REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    confirmed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(notice_id, confirmed_by)
);

-- 6. TẠO BẢNG THI ĐUA THEO TUẦN (WEEKLY_COMPETITIONS)
CREATE TABLE IF NOT EXISTS public.weekly_competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 35),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)) DEFAULT 1,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    flower_points INTEGER DEFAULT 0 NOT NULL,     -- Bông hoa điểm 10
    discipline_points INTEGER DEFAULT 0 NOT NULL, -- Điểm nề nếp / chuyên cần
    star_points INTEGER DEFAULT 0 NOT NULL,       -- Ngôi sao khen thưởng
    deduction_points INTEGER DEFAULT 0 NOT NULL,  -- Điểm trừ / nhắc nhở
    rank_position INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(week_number, semester, student_id)
);

-- 7. TẠO BẢNG NHẬT KÝ CỘNG/TRỪ ĐIỂM (COMPETITION_LOGS)
CREATE TABLE IF NOT EXISTS public.competition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    point_type TEXT NOT NULL CHECK (point_type IN ('flower', 'discipline', 'star', 'deduction')),
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TẠO BẢNG ALBUM HOẠT ĐỘNG (ACTIVITY_ALBUMS)
CREATE TABLE IF NOT EXISTS public.activity_albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE DEFAULT CURRENT_DATE NOT NULL,
    cover_image_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TẠO BẢNG ẢNH HOẠT ĐỘNG (ACTIVITY_PHOTOS)
CREATE TABLE IF NOT EXISTS public.activity_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.activity_albums(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TRIGGER TỰ ĐỘNG TẠO PROFILE KHI CÓ USER MỚI ĐĂNG KÝ (SUPABASE AUTH SYNC)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone, student_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Thành viên Lớp 5/4'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'student_code'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- BẬT ROW LEVEL SECURITY (RLS) CHO TẤT CẢ CÁC BẢNG
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- THIẾT LẬP POLICIES (QUY TẮC PHÂN QUYỀN BẢO MẬT)
-- ==============================================================================

-- PROFILES POLICIES
CREATE POLICY "Mọi người đều có thể đọc profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Người dùng tự cập nhật profile của mình" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- STUDENTS POLICIES
CREATE POLICY "Mọi người đều có thể xem danh sách học sinh" ON public.students
    FOR SELECT USING (true);

CREATE POLICY "Chỉ giáo viên và admin được thêm/sửa/xóa học sinh" ON public.students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
        )
    );

-- NOTICES POLICIES
CREATE POLICY "Mọi người đều có thể xem dặn dò và thông báo" ON public.notices
    FOR SELECT USING (true);

CREATE POLICY "Chỉ giáo viên và admin được tạo/sửa/xóa dặn dò" ON public.notices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
        )
    );

-- NOTICE CONFIRMATIONS POLICIES
CREATE POLICY "Mọi người có thể xem xác nhận dặn dò" ON public.notice_confirmations
    FOR SELECT USING (true);

CREATE POLICY "Người dùng có thể tạo xác nhận dặn dò của mình" ON public.notice_confirmations
    FOR INSERT WITH CHECK (auth.uid() = confirmed_by);

-- WEEKLY COMPETITIONS POLICIES
CREATE POLICY "Mọi người có thể xem thi đua" ON public.weekly_competitions
    FOR SELECT USING (true);

CREATE POLICY "Chỉ giáo viên và admin được quản lý điểm thi đua" ON public.weekly_competitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
        )
    );

-- COMPETITION LOGS POLICIES
CREATE POLICY "Mọi người có thể xem nhật ký điểm" ON public.competition_logs
    FOR SELECT USING (true);

CREATE POLICY "Chỉ giáo viên và admin được ghi điểm" ON public.competition_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
        )
    );

-- ACTIVITY ALBUMS & PHOTOS POLICIES
CREATE POLICY "Mọi người có thể xem album ảnh" ON public.activity_albums
    FOR SELECT USING (true);

CREATE POLICY "Chỉ giáo viên và admin được tạo album" ON public.activity_albums
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "Mọi người có thể xem ảnh trong album" ON public.activity_photos
    FOR SELECT USING (true);

CREATE POLICY "Chỉ giáo viên và admin được upload ảnh hoạt động" ON public.activity_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
        )
    );

-- ==============================================================================
-- TẠO STORAGE BUCKETS VÀ CẤU HÌNH QUYỀN TRUY CẬP (STORAGE POLICIES)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-avatars', 'student-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Cho phép xem ảnh công khai
CREATE POLICY "Public Access for student avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'student-avatars');

CREATE POLICY "Public Access for activity photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'activity-photos');

-- Cho phép upload ảnh khi đăng nhập
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'student-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload activity photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'activity-photos' AND auth.role() = 'authenticated');
