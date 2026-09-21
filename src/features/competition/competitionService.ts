import { supabase } from '../../lib/supabase';
import { WeeklyCompetition, CompetitionLog } from '../../types/database.types';

export const competitionService = {
  // Lấy danh sách điểm thi đua của tuần
  async getWeeklyCompetitions(weekNumber: number, semester = 1): Promise<WeeklyCompetition[]> {
    // 1. Lấy tất cả học sinh
    const { data: students, error: sErr } = await supabase
      .from('students')
      .select('*')
      .order('student_code', { ascending: true });

    if (sErr) throw sErr;
    if (!students || students.length === 0) return [];

    // 2. Lấy điểm tuần
    const { data: scores, error: scErr } = await supabase
      .from('weekly_competitions')
      .select('*')
      .eq('week_number', weekNumber)
      .eq('semester', semester);

    if (scErr) throw scErr;

    // Merge students with their weekly score
    const scoreMap = new Map<string, any>();
    (scores || []).forEach((sc) => scoreMap.set(sc.student_id, sc));

    const result: WeeklyCompetition[] = students.map((st) => {
      const sc = scoreMap.get(st.id);
      const flower = sc?.flower_points || 0;
      const discipline = sc?.discipline_points || 0;
      const star = sc?.star_points || 0;
      const deduction = sc?.deduction_points || 0;
      const total = flower * 10 + discipline * 5 + star * 15 - deduction * 5;

      return {
        id: sc?.id || `temp-${st.id}`,
        week_number: weekNumber,
        semester,
        student_id: st.id,
        flower_points: flower,
        discipline_points: discipline,
        star_points: star,
        deduction_points: deduction,
        total_score: total,
        note: sc?.note || '',
        student: st,
      };
    });

    // Sort by total score descending to compute rank
    result.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    result.forEach((item, index) => {
      item.rank_position = index + 1;
    });

    return result;
  },

  // Cộng điểm / trừ điểm thi đua cho học sinh
  async awardPoints(
    studentId: string,
    weekNumber: number,
    pointType: 'flower' | 'discipline' | 'star' | 'deduction',
    points: number,
    reason: string,
    semester = 1,
    profileId?: string
  ): Promise<void> {
    // 1. Tìm hoặc khởi tạo bản ghi weekly_competitions
    const { data: existing } = await supabase
      .from('weekly_competitions')
      .select('*')
      .eq('student_id', studentId)
      .eq('week_number', weekNumber)
      .eq('semester', semester)
      .maybeSingle();

    const flower = (existing?.flower_points || 0) + (pointType === 'flower' ? points : 0);
    const discipline = (existing?.discipline_points || 0) + (pointType === 'discipline' ? points : 0);
    const star = (existing?.star_points || 0) + (pointType === 'star' ? points : 0);
    const deduction = (existing?.deduction_points || 0) + (pointType === 'deduction' ? points : 0);

    const { error: upsertErr } = await supabase
      .from('weekly_competitions')
      .upsert({
        student_id: studentId,
        week_number: weekNumber,
        semester,
        flower_points: Math.max(0, flower),
        discipline_points: Math.max(0, discipline),
        star_points: Math.max(0, star),
        deduction_points: Math.max(0, deduction),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'week_number,semester,student_id' });

    if (upsertErr) throw upsertErr;

    // 2. Ghi nhật ký cộng điểm (competition_logs)
    await supabase.from('competition_logs').insert({
      student_id: studentId,
      week_number: weekNumber,
      point_type: pointType,
      points,
      reason,
      created_by: profileId,
    });
  },

  // Lấy nhật ký điểm thi đua gần đây
  async getRecentLogs(limit = 15): Promise<CompetitionLog[]> {
    const { data, error } = await supabase
      .from('competition_logs')
      .select(`
        *,
        student:students(full_name, student_code, team_number)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Lỗi lấy nhật ký điểm:', error);
      return [];
    }
    return data || [];
  }
};
