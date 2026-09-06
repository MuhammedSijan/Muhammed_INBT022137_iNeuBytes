const { query } = require('../config/db');

/**
 * Get Dashboard KPIs & Summary Counters
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const [patientCountRes] = await query('SELECT COUNT(*) AS count FROM patients');
    const [doctorCountRes] = await query('SELECT COUNT(*) AS count FROM doctors WHERE is_active = 1');
    const [deptCountRes] = await query('SELECT COUNT(*) AS count FROM departments');
    const [totalAppointmentsRes] = await query('SELECT COUNT(*) AS count FROM appointments');
    const [pendingRes] = await query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Pending'");
    const [confirmedRes] = await query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Confirmed'");
    const [completedRes] = await query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Completed'");
    const [cancelledRes] = await query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Cancelled'");

    const [todayCountRes] = await query("SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()");

    return res.status(200).json({
      success: true,
      data: {
        total_patients: patientCountRes ? patientCountRes.count : 0,
        total_doctors: doctorCountRes ? doctorCountRes.count : 0,
        total_departments: deptCountRes ? deptCountRes.count : 0,
        total_appointments: totalAppointmentsRes ? totalAppointmentsRes.count : 0,
        pending_appointments: pendingRes ? pendingRes.count : 0,
        confirmed_appointments: confirmedRes ? confirmedRes.count : 0,
        completed_appointments: completedRes ? completedRes.count : 0,
        cancelled_appointments: cancelledRes ? cancelledRes.count : 0,
        today_appointments: todayCountRes ? todayCountRes.count : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Comprehensive Analytics Reports for Charts & Visual Summaries
 */
const getAnalyticsReports = async (req, res, next) => {
  try {
    // 1. Appointments by Status
    const appointments = await query(`
      SELECT a.*, dept.name AS department_name, du.full_name AS doctor_name
      FROM appointments a
      JOIN departments dept ON a.department_id = dept.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
    `);

    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0
    };

    const departmentCounts = {};
    const doctorWorkload = {};

    appointments.forEach(app => {
      // By Status
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }

      // By Department
      const deptName = app.department_name || 'General';
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;

      // By Doctor
      const docName = app.doctor_name || 'Doctor';
      doctorWorkload[docName] = (doctorWorkload[docName] || 0) + 1;
    });

    const byStatus = Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status]
    }));

    const byDepartment = Object.keys(departmentCounts).map(department => ({
      department,
      count: departmentCounts[department]
    }));

    const byDoctor = Object.keys(doctorWorkload).map(doctor => ({
      doctor,
      count: doctorWorkload[doctor]
    }));

    return res.status(200).json({
      success: true,
      data: {
        appointments_by_status: byStatus,
        appointments_by_department: byDepartment,
        doctor_workload: byDoctor,
        total_records: appointments.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getAnalyticsReports
};
