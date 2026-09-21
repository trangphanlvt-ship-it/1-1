import { supabase } from '../../lib/supabase';
import { Student } from '../../types/database.types';
import * as XLSX from 'xlsx';

export const studentService = {
  // Lấy danh sách toàn bộ học sinh lớp 5/4
  async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('student_code', { ascending: true });

    if (error) {
      console.error('Lỗi lấy danh sách học sinh:', error);
      throw error;
    }
    return data || [];
  },

  // Thêm mới hoặc cập nhật học sinh
  async upsertStudent(student: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .upsert({
        ...student,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Lỗi lưu học sinh:', error);
      throw error;
    }
    return data;
  },

  // Xóa học sinh
  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Lỗi xóa học sinh:', error);
      throw error;
    }
  },

  // Nhập danh sách học sinh hàng loạt từ file Excel
  async batchImportStudents(studentsList: Partial<Student>[]): Promise<{ count: number }> {
    const { data, error } = await supabase
      .from('students')
      .upsert(studentsList, { onConflict: 'student_code' })
      .select();

    if (error) {
      console.error('Lỗi nhập học sinh hàng loạt:', error);
      throw error;
    }
    return { count: data?.length || 0 };
  },

  // Xuất danh sách học sinh ra file Excel (.xlsx)
  exportToExcel(students: Student[], filename = 'Danh_Sach_Hoc_Sinh_Lop_5_4.xlsx') {
    const exportData = students.map((s, index) => ({
      'STT': index + 1,
      'Mã Học Sinh': s.student_code,
      'Họ và Tên': s.full_name,
      'Ngày Sinh': s.dob || '',
      'Giới Tính': s.gender || 'Nam',
      'Tổ': `Tổ ${s.team_number}`,
      'Chức Vụ': s.role_in_class || 'Học sinh',
      'Họ Tên Phụ Huynh': s.parent_name || '',
      'SĐT Phụ Huynh': s.parent_phone || '',
      'Địa Chỉ': s.address || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lớp 5-4 Lê Văn Tám');
    XLSX.writeFile(workbook, filename);
  },

  // Tải file mẫu Excel chuẩn để giáo viên điền thông tin
  downloadSampleExcelTemplate() {
    const sampleData = [
      {
        'Mã Học Sinh': '5401',
        'Họ và Tên': 'Nguyễn Văn An',
        'Ngày Sinh': '2016-03-15',
        'Giới Tính': 'Nam',
        'Tổ': '1',
        'Chức Vụ': 'Lớp trưởng',
        'Họ Tên Phụ Huynh': 'Nguyễn Văn Bình',
        'SĐT Phụ Huynh': '0901234567',
        'Địa Chỉ': 'Quận Hải Châu, TP Đà Nẵng'
      },
      {
        'Mã Học Sinh': '5402',
        'Họ và Tên': 'Trần Thị Mai',
        'Ngày Sinh': '2016-08-20',
        'Giới Tính': 'Nữ',
        'Tổ': '1',
        'Chức Vụ': 'Lớp phó học tập',
        'Họ Tên Phụ Huynh': 'Trần Văn Cường',
        'SĐT Phụ Huynh': '0907654321',
        'Địa Chỉ': 'Quận Thanh Khê, TP Đà Nẵng'
      },
      {
        'Mã Học Sinh': '5403',
        'Họ và Tên': 'Lê Hoàng Nam',
        'Ngày Sinh': '2016-11-05',
        'Giới Tính': 'Nam',
        'Tổ': '2',
        'Chức Vụ': 'Tổ trưởng tổ 2',
        'Họ Tên Phụ Huynh': 'Lê Văn Đức',
        'SĐT Phụ Huynh': '0912345678',
        'Địa Chỉ': 'Quận Hải Châu, TP Đà Nẵng'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Lop_5_4');
    XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh_Lop_5_4.xlsx');
  }
};
