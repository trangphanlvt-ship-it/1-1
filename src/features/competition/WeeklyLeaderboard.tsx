import React, { useState, useEffect } from 'react';
import { WeeklyCompetition, Student, CompetitionLog } from '../../types/database.types';
import { competitionService } from './competitionService';
import { studentService } from '../students/studentService';
import { useAuth } from '../../context/AuthContext';
import { ScoreAwardModal } from './ScoreAwardModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getInitials, getTeamBadgeColor, formatDateTimeVN } from '../../utils/formatters';
import { 
  Trophy, 
  Sparkles, 
  Flower2, 
  Star, 
  Award, 
  ShieldAlert, 
  PlusCircle, 
  Crown, 
  Medal, 
  History,
  TrendingUp,
  Flag
} from 'lucide-react';

interface WeeklyLeaderboardProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WeeklyLeaderboard: React.FC<WeeklyLeaderboardProps> = ({ onShowToast }) => {
  const { role } = useAuth();
  const canEdit = role === 'teacher' || role === 'admin';

  const [currentWeek, setCurrentWeek] = useState(3);
  const [semester, setSemester] = useState(1);
  const [competitions, setCompetitions] = useState<WeeklyCompetition[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [recentLogs, setRecentLogs] = useState<CompetitionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compData, studData, logsData] = await Promise.all([
        competitionService.getWeeklyCompetitions(currentWeek, semester),
        studentService.getStudents(),
        competitionService.getRecentLogs(8)
      ]);
      setCompetitions(compData);
      setAllStudents(studData);
      setRecentLogs(logsData);
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi khi tải bảng thi đua tuần!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWeek, semester]);

  // Compute team scores
  const teamScores = [1, 2, 3, 4].map((teamNum) => {
    const teamMembers = competitions.filter((c) => c.student?.team_number === teamNum);
    const total = teamMembers.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
    const flowerSum = teamMembers.reduce((acc, curr) => acc + (curr.flower_points || 0), 0);
    const starSum = teamMembers.reduce((acc, curr) => acc + (curr.star_points || 0), 0);
    return {
      teamNum,
      total,
      flowerSum,
      starSum,
      memberCount: teamMembers.length,
    };
  }).sort((a, b) => b.total - a.total);

  // Top 3 students
  const top3 = competitions.slice(0, 3).filter((c) => (c.total_score || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-200" />
            <span>Bảng Vàng Thi Đua & Khen Thưởng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Thi Đua Tuần {currentWeek} • Học Kỳ {semester}
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
            Vinh danh những bông hoa điểm tốt, ngôi sao chăm ngoan và tinh thần học tập xuất sắc của các em học sinh Lớp 5/4.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Week selector */}
          <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/25">
            <span className="text-xs font-bold px-2 text-white">Tuần:</span>
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="bg-white text-slate-900 text-xs font-bold px-2.5 py-1.5 rounded-xl focus:outline-none"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w}
                </option>
              ))}
            </select>
          </div>

          {canEdit && (
            <button
              onClick={() => setIsAwardModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white text-amber-900 text-xs font-black hover:bg-amber-50 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Chấm Điểm & Tặng Sao</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Đang tính toán bảng vàng thi đua tuần..." />
      ) : (
        <>
          {/* Top 3 Podium (Bục Vinh Quang) */}
          {top3.length > 0 && (
            <div className="bg-gradient-to-b from-sky-50 to-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm">
              <div className="text-center mb-6">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>TOP 3 HỌC SINH XUẤT SẮC NHẤT TUẦN {currentWeek}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
                {/* Hạng 2 */}
                {top3[1] && (
                  <div className="order-2 md:order-1 bg-white rounded-2xl border-2 border-slate-200 p-5 text-center shadow-md flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center mb-2 shadow">
                      2
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-black text-lg flex items-center justify-center shadow-md mb-2">
                      {getInitials(top3[1].student?.full_name)}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">{top3[1].student?.full_name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">Tổ {top3[1].student?.team_number}</span>
                    <div className="mt-3 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs">
                      {top3[1].total_score} điểm
                    </div>
                  </div>
                )}

                {/* Hạng 1 (Center - Tallest) */}
                {top3[0] && (
                  <div className="order-1 md:order-2 bg-gradient-to-b from-amber-100 to-white rounded-3xl border-2 border-amber-400 p-6 text-center shadow-xl flex flex-col items-center md:-translate-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center mb-2 shadow-lg animate-bounce-slow">
                      👑 1
                    </div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white font-black text-xl flex items-center justify-center shadow-lg mb-2 ring-4 ring-amber-200">
                      {getInitials(top3[0].student?.full_name)}
                    </div>
                    <h4 className="font-black text-base text-slate-900">{top3[0].student?.full_name}</h4>
                    <span className="text-xs text-amber-700 font-bold">Hạng Nhất Tuần • Tổ {top3[0].student?.team_number}</span>
                    <div className="mt-3 px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 font-black text-sm shadow-md">
                      🌟 {top3[0].total_score} Điểm Xuất Sắc
                    </div>
                  </div>
                )}

                {/* Hạng 3 */}
                {top3[2] && (
                  <div className="order-3 md:order-3 bg-white rounded-2xl border-2 border-amber-200 p-5 text-center shadow-md flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center mb-2 shadow">
                      3
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-700 text-white font-black text-lg flex items-center justify-center shadow-md mb-2">
                      {getInitials(top3[2].student?.full_name)}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">{top3[2].student?.full_name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">Tổ {top3[2].student?.team_number}</span>
                    <div className="mt-3 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-xs">
                      {top3[2].total_score} điểm
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Rankings (Cờ Thi Đua 4 Tổ) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center space-x-2">
              <Flag className="w-4 h-4 text-rose-500" />
              <span>Bảng Xếp Hạng Cờ Thi Đua 4 Tổ Trong Lớp</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {teamScores.map((team, idx) => {
                const teamBadge = getTeamBadgeColor(team.teamNum);
                return (
                  <div
                    key={team.teamNum}
                    className={`rounded-2xl border p-4 flex flex-col justify-between ${teamBadge.bg} ${teamBadge.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black ${teamBadge.text}`}>
                        TỔ {team.teamNum}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white font-black shadow-sm text-slate-800">
                        {idx === 0 ? '🏆 Dẫn đầu' : `Hạng #${idx + 1}`}
                      </span>
                    </div>

                    <div className="my-2">
                      <p className="text-2xl font-black text-slate-800">{team.total} <span className="text-xs font-normal text-slate-500">điểm</span></p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-2 border-t border-slate-200/60">
                      <span className="flex items-center space-x-1">
                        <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>{team.flowerSum} hoa</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{team.starSum} sao</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Full List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Bảng Tổng Sắp Chi Tiết Điểm Thi Đua Từng Học Sinh (Tuần {currentWeek})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">Hạng</th>
                    <th className="p-3">Mã HS</th>
                    <th className="p-3">Họ và Tên</th>
                    <th className="p-3">Tổ</th>
                    <th className="p-3 text-center">🌸 Hoa Điểm Tốt</th>
                    <th className="p-3 text-center">⭐ Sao Khen Thưởng</th>
                    <th className="p-3 text-center">🎖️ Điểm Nề Nếp</th>
                    <th className="p-3 text-center">⚠️ Điểm Trừ</th>
                    <th className="p-3 text-right">Tổng Điểm Tuần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitions.map((comp) => {
                    const rank = comp.rank_position || 0;
                    return (
                      <tr key={comp.student_id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold">
                          {rank === 1 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black">🥇 #1</span>
                          ) : rank === 2 ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-black">🥈 #2</span>
                          ) : rank === 3 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black">🥉 #3</span>
                          ) : (
                            <span className="text-slate-400 font-mono">#{rank}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-sky-700">#{comp.student?.student_code}</td>
                        <td className="p-3 font-bold text-slate-800">{comp.student?.full_name}</td>
                        <td className="p-3 font-medium">Tổ {comp.student?.team_number}</td>
                        <td className="p-3 text-center font-bold text-rose-600">
                          {comp.flower_points > 0 ? `+${comp.flower_points}` : 0}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-600">
                          {comp.star_points > 0 ? `+${comp.star_points}` : 0}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          {comp.discipline_points > 0 ? `+${comp.discipline_points}` : 0}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-400">
                          {comp.deduction_points > 0 ? `-${comp.deduction_points}` : 0}
                        </td>
                        <td className="p-3 text-right font-black text-sm text-sky-700">
                          {comp.total_score} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Points Log */}
          {recentLogs.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Nhật Ký Khen Thưởng & Ghi Điểm Gần Đây</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800">
                        {log.student?.full_name} <span className="text-[11px] font-normal text-slate-500">(Tổ {log.student?.team_number})</span>
                      </p>
                      <p className="text-slate-600 mt-0.5">{log.reason}</p>
                      <span className="text-[10px] text-slate-400">{formatDateTimeVN(log.created_at)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                      log.point_type === 'flower'
                        ? 'bg-rose-100 text-rose-700'
                        : log.point_type === 'star'
                        ? 'bg-amber-100 text-amber-800'
                        : log.point_type === 'discipline'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {log.point_type === 'deduction' ? `-${log.points}` : `+${log.points}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Award Score Modal */}
      <ScoreAwardModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        students={allStudents}
        currentWeek={currentWeek}
        onAwardSuccess={(msg) => {
          onShowToast(msg, 'success');
          fetchData();
        }}
      />
    </div>
  );
};
