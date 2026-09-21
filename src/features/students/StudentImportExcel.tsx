import React, { useState, useRef } from 'react';
import { Modal } from '../../components/common/Modal';
import { Student } from '../../types/database.types';
import { studentService } from './studentService';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentImportExcelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (msg: string) => void;
}

export const StudentImportExcel: React.FC<StudentImportExcelProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [parsedData, setParsedData] = useState<Partial<Student>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (rawJson.length === 0) {
          setError('File Excel không có dữ liệu!');
          return;
        }

        // Map column names flexibly
        const formatted: Partial<Student>[] = rawJson.map((row: any, idx: number) => {
          const studentCode =
            row['Mã Học Sinh'] ||
            row['MaHS'] ||
            row['Mã HS'] ||
            row['student_code'] ||
            `54${String(idx + 1).padStart(2, '0')}`;

          const fullName =
            row['Họ và Tên'] ||
            row['Họ Tên'] ||
            row['HoVaTen'] ||
            row['full_name'] ||
            `Học sinh ${idx + 1}`;

          const rawDob = row['Ngày Sinh'] || row['NgaySinh'] || row['dob'];
          let dobFormatted = undefined;
          if (rawDob) {
            if (typeof rawDob === 'number') {
              // Excel serial date format
              const dateObj = new Date((rawDob - (25567 + 2)) * 86400 * 1000);
              dobFormatted = dateObj.toISOString().split('T')[0];
            } else if (typeof rawDob === 'string') {
              // Convert DD/MM/YYYY to YYYY-MM-DD
              const parts = rawDob.split(/[-/.]/);
              if (parts.length === 3 && parts[2].length === 4) {
                dobFormatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else {
                dobFormatted = rawDob;
              }
            }
          }

          const rawGender = row['Giới Tính'] || row['GioiTinh'] || row['gender'] || 'Nam';
          const gender = String(rawGender).toLowerCase().includes('nữ') || String(rawGender).toLowerCase().includes('nu') ? 'Nữ' : 'Nam';

          const rawTeam = row['Tổ'] || row['To'] || row['team_number'] || 1;
          const teamNumber = Math.min(4, Math.max(1, parseInt(String(rawTeam).replace(/\D/g, '')) || 1));

          return {
            student_code: String(studentCode).trim(),
            full_name: String(fullName).trim(),
            dob: dobFormatted,
            gender,
            team_number: teamNumber,
            role_in_class: row['Chức Vụ'] || row['ChucVu'] || row['role_in_class'] || 'Học sinh',
            parent_name: row['Họ Tên Phụ Huynh'] || row['Phụ Huynh'] || row['parent_name'] || undefined,
            parent_phone: row['SĐT Phụ Huynh'] || row['SĐT'] || row['parent_phone'] || undefined,
            address: row['Địa Chỉ'] || row['DiaChi'] || row['address'] || undefined,
          };
        });

        setParsedData(formatted);
      } catch (err: any) {
        console.error(err);
        setError('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const { count } = await studentService.batchImportStudents(parsedData);
      onImportSuccess(`Đã nhập thành công ${count} học sinh vào hệ thống!`);
      setParsedData([]);
      setFileName('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi nhập dữ liệu học sinh vào Database!');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    studentService.downloadSampleExcelTemplate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tải Lên Danh Sách Học Sinh Từ Excel"
      subtitle="Nhập danh sách học sinh nhanh chóng bằng file Excel (.xlsx / .csv)"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Step 1: Download Template or Choose File */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-2xl gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white rounded-xl text-sky-600 shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-900">Chưa có file danh sách chuẩn?</p>
              <p className="text-[11px] text-sky-700">Tải file mẫu Excel chuẩn để điền thông tin nhanh nhất</p>
            </div>
          </div>
          <button
            onClick={handleDownloadSample}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Tải File Mẫu (.xlsx)</span>
          </button>
        </div>

        {/* Upload dropzone */}
        {parsedData.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Nhấp để chọn file Excel danh sách lớp</p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ các định dạng .xlsx, .xls, .csv</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">{fileName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {parsedData.length} học sinh
                </span>
              </div>
              <button
                onClick={() => { setParsedData([]); setFileName(''); }}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Chọn lại file</span>
              </button>
            </div>

            {/* Preview Table */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Mã HS</th>
                    <th className="p-2.5">Họ và Tên</th>
                    <th className="p-2.5">Tổ</th>
                    <th className="p-2.5">Chức vụ</th>
                    <th className="p-2.5">Phụ huynh</th>
                    <th className="p-2.5">SĐT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-sky-700">{item.student_code}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{item.full_name}</td>
                      <td className="p-2.5">Tổ {item.team_number}</td>
                      <td className="p-2.5">{item.role_in_class}</td>
                      <td className="p-2.5 text-slate-500">{item.parent_name || '—'}</td>
                      <td className="p-2.5 text-slate-500 font-mono">{item.parent_phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal actions */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          {parsedData.length > 0 && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Đang nhập...' : `Xác Nhận Lưu ${parsedData.length} Học Sinh`}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
