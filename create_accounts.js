import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmcrpmovyghnzbmvzwzf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtY3JwbW92eWdobnpibXZ6d3pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTk3NDM3OSwiZXhwIjoyMTA1NTUwMzc5fQ.9qcfV-lVNFzt_d8cGzCuv91OKBU6TcAKBNvhCRuGOlE';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const accounts = [
  {
    email: 'trangphanlvt@gmail.com',
    password: 'Password123@',
    full_name: 'Cô Phan Thị Diễm Trang',
    role: 'teacher',
    phone: '0901234567',
  },
  {
    email: 'admin@lop54.edu.vn',
    password: 'Password123@',
    full_name: 'Quản Trị Viên Hệ Thống',
    role: 'admin',
    phone: '0909999999',
  },
  {
    email: 'hocsinh@lop54.edu.vn',
    password: 'Password123@',
    full_name: 'Nguyễn Văn An (Học sinh)',
    role: 'student',
    student_code: '5401',
    phone: '0901112223',
  },
];

async function createAccounts() {
  console.log('--- KHỞI TẠO TÀI KHOẢN TRÊN SUPABASE ---');

  for (const acc of accounts) {
    try {
      // 1. Tạo hoặc cập nhật User trong Auth
      const { data: user, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.full_name,
          role: acc.role,
          phone: acc.phone,
          student_code: acc.student_code,
        },
      });

      if (createErr) {
        if (createErr.message.includes('already registered') || createErr.message.includes('already exists')) {
          console.log(`Tài khoản ${acc.email} đã tồn tại. Đang cập nhật mật khẩu...`);
          // Tìm user theo email
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = users.find((u) => u.email === acc.email);
          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              password: acc.password,
              email_confirm: true,
              user_metadata: {
                full_name: acc.full_name,
                role: acc.role,
                phone: acc.phone,
                student_code: acc.student_code,
              },
            });
            // Update profile table
            await supabaseAdmin.from('profiles').upsert({
              id: existingUser.id,
              full_name: acc.full_name,
              role: acc.role,
              phone: acc.phone,
              student_code: acc.student_code,
            });
            console.log(`✅ Đã cập nhật mật khẩu cho: ${acc.email}`);
          }
        } else {
          console.error(`❌ Lỗi tạo ${acc.email}:`, createErr.message);
        }
      } else if (user?.user) {
        console.log(`✅ Đã tạo thành công tài khoản: ${acc.email} (${acc.role})`);
        // Tạo profile
        await supabaseAdmin.from('profiles').upsert({
          id: user.user.id,
          full_name: acc.full_name,
          role: acc.role,
          phone: acc.phone,
          student_code: acc.student_code,
        });
      }
    } catch (e) {
      console.error('Lỗi ngoại lệ:', e);
    }
  }

  console.log('--- HOÀN TẤT KHỞI TẠO TÀI KHOẢN ---');
}

createAccounts();
