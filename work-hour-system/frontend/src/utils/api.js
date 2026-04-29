import axios from 'axios';

const API_BASE_URL = '/api/v1';
const USE_MOCK = true;

const mockUsers = [
  { personCode: 'EMP001', name: '张三', departmentId: 'TECH', departmentName: '技术部', role: 'Employee', status: 1, email: 'zhangsan@company.com' },
  { personCode: 'EMP002', name: '李四', departmentId: 'TECH', departmentName: '技术部', role: 'Employee', status: 1, email: 'lisi@company.com' },
  { personCode: 'MGR001', name: '王经理', departmentId: 'TECH', departmentName: '技术部', role: 'DeptManager', status: 1, email: 'wang.manager@company.com' },
  { personCode: 'MGR002', name: '李项目经理', departmentId: 'TECH', departmentName: '技术部', role: 'PM', status: 1, email: 'li.pm@company.com' },
  { personCode: 'ADMIN', name: '系统管理员', departmentId: 'HR', departmentName: '人力资源部', role: 'Admin', status: 1, email: 'admin@company.com' },
];

const mockProjects = [
  { projectCode: 'PRJ001', projectName: '智能工厂系统', customerName: '华为科技', managerCode: 'MGR002', managerName: '李项目经理', status: 1, startDate: '2026-01-01', endDate: '2026-12-31' },
  { projectCode: 'PRJ002', projectName: '数据中台项目', customerName: '阿里巴巴', managerCode: 'MGR002', managerName: '李项目经理', status: 1, startDate: '2026-02-01', endDate: '2026-11-30' },
  { projectCode: 'PRJ003', projectName: '移动办公平台', customerName: '腾讯科技', managerCode: 'MGR001', managerName: '王经理', status: 1, startDate: '2026-03-01', endDate: '2026-10-31' },
  { projectCode: 'PRJ004', projectName: '智慧城市项目', customerName: '政府单位', managerCode: 'MGR001', managerName: '王经理', status: 1, startDate: '2026-04-01', endDate: '2027-03-31' },
];

let mockWorkHours = [];

let mockSyncLogs = [
  { id: 1, syncTime: '2026-04-29 08:00:00', syncType: '自动同步', status: '成功', recordCount: 156, duration: '2.3s' },
  { id: 2, syncTime: '2026-04-28 20:00:00', syncType: '自动同步', status: '成功', recordCount: 89, duration: '1.8s' },
  { id: 3, syncTime: '2026-04-28 12:00:00', syncType: '手动同步', status: '成功', recordCount: 234, duration: '3.1s' },
  { id: 4, syncTime: '2026-04-28 08:00:00', syncType: '自动同步', status: '成功', recordCount: 178, duration: '2.5s' },
  { id: 5, syncTime: '2026-04-27 20:00:00', syncType: '自动同步', status: '失败', recordCount: 0, duration: '0.5s', errorMessage: '网络连接超时' },
];

let nextWorkHourId = 8;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const mockRequest = (handler) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(handler());
    }, 200);
  });
};

export const authAPI = {
  login: (personCode) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const user = mockUsers.find(u => u.personCode === personCode);
        if (user) {
          return {
            data: {
              code: 200,
              data: {
                ...user,
                token: `mock-token-${personCode}-${Date.now()}`,
              },
              message: '登录成功',
            },
          };
        }
        return {
          data: {
            code: 400,
            message: '用户不存在',
          },
        };
      });
    }
    return api.post('/auth/login', { personCode });
  },
  getUsers: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockUsers,
        },
      }));
    }
    return api.get('/auth/users');
  },
};

export const workHourAPI = {
  getWorkHours: (params) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        let result = [...mockWorkHours];
        if (params?.personCode) {
          result = result.filter(w => w.personCode === params.personCode);
        }
        if (params?.status) {
          result = result.filter(w => w.status === params.status);
        }
        if (params?.workType) {
          result = result.filter(w => w.workType === params.workType);
        }
        return {
          data: {
            code: 200,
            data: result,
          },
        };
      });
    }
    return api.get('/work-hours', { params });
  },
  getAllWorkHours: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockWorkHours,
        },
      }));
    }
    return api.get('/work-hours/all');
  },
  getWorkHour: (id) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockWorkHours.find(w => w.id === id),
        },
      }));
    }
    return api.get(`/work-hours/${id}`);
  },
  createWorkHour: (data) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const project = mockProjects.find(p => p.projectCode === data.projectCode);
        const newWorkHour = {
          id: nextWorkHourId++,
          ...data,
          personCode: user.personCode,
          personName: user.name,
          departmentId: user.departmentId,
          departmentName: user.departmentName,
          projectName: project?.projectName || data.projectCode,
          status: 'Pending',
          createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
        mockWorkHours.push(newWorkHour);
        return {
          data: {
            code: 200,
            data: newWorkHour,
            message: '创建成功',
          },
        };
      });
    }
    return api.post('/work-hours', data);
  },
  updateWorkHour: (id, data) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const index = mockWorkHours.findIndex(w => w.id === id);
        if (index >= 0) {
          const project = mockProjects.find(p => p.projectCode === data.projectCode);
          mockWorkHours[index] = {
            ...mockWorkHours[index],
            ...data,
            projectName: project?.projectName || data.projectCode,
          };
          return {
            data: {
              code: 200,
              data: mockWorkHours[index],
              message: '更新成功',
            },
          };
        }
        return {
          data: {
            code: 404,
            message: '记录不存在',
          },
        };
      });
    }
    return api.put(`/work-hours/${id}`, data);
  },
  deleteWorkHour: (id) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        mockWorkHours = mockWorkHours.filter(w => w.id !== id);
        return {
          data: {
            code: 200,
            message: '删除成功',
          },
        };
      });
    }
    return api.delete(`/work-hours/${id}`);
  },
  submitWorkHour: (id) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const index = mockWorkHours.findIndex(w => w.id === id);
        if (index >= 0) {
          mockWorkHours[index].status = 'Submitted';
          mockWorkHours[index].submitTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
          return {
            data: {
              code: 200,
              message: '提交成功',
            },
          };
        }
        return {
          data: {
            code: 404,
            message: '记录不存在',
          },
        };
      });
    }
    return api.post(`/work-hours/${id}/submit`);
  },
  getPendingApprovals: (user) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        let pending = mockWorkHours.filter(w => w.status === 'Submitted');
        
        if (user?.role === 'PM') {
          pending = pending.filter(w => {
            const project = mockProjects.find(p => p.projectCode === w.projectCode);
            return project && project.managerCode === user.personCode;
          });
        } else if (user?.role === 'DeptManager') {
          pending = pending.filter(w => w.status === 'Submitted' || w.status === 'PMApproved');
        }
        
        return {
          data: {
            code: 200,
            data: pending,
          },
        };
      });
    }
    return api.get('/work-hours/pending-approvals');
  },
  approveWorkHour: (id, approverName, approverRole) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const index = mockWorkHours.findIndex(w => w.id === id);
        if (index >= 0) {
          const record = mockWorkHours[index];
          let newStatus = 'Approved';
          let message = '审批通过';
          
          if (approverRole === 'PM') {
            newStatus = 'PMApproved';
            message = '项目经理已审批，等待部门经理审批';
          } else if (approverRole === 'DeptManager') {
            if (record.status === 'Submitted') {
              newStatus = 'Approved';
              message = '部门经理直接审批通过';
            } else if (record.status === 'PMApproved') {
              newStatus = 'Approved';
              message = '部门经理审批通过，流程完成';
            }
          }
          
          mockWorkHours[index].status = newStatus;
          mockWorkHours[index].approverName = approverName || '管理员';
          mockWorkHours[index].approveTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
          return {
            data: {
              code: 200,
              message,
            },
          };
        }
        return {
          data: {
            code: 404,
            message: '记录不存在',
          },
        };
      });
    }
    return api.post(`/work-hours/${id}/approve`, { approverName, approverRole });
  },
  rejectWorkHour: (id, approverName, reason) => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const index = mockWorkHours.findIndex(w => w.id === id);
        if (index >= 0) {
          mockWorkHours[index].status = 'Rejected';
          mockWorkHours[index].approverName = approverName || '管理员';
          mockWorkHours[index].approveTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
          mockWorkHours[index].rejectReason = reason || '未填写驳回原因';
          return {
            data: {
              code: 200,
              message: '已驳回',
            },
          };
        }
        return {
          data: {
            code: 404,
            message: '记录不存在',
          },
        };
      });
    }
    return api.post(`/work-hours/${id}/reject`, { approverName, reason });
  },
};

export const basicDataAPI = {
  getCurrentUser: () => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return {
          data: {
            code: 200,
            data: user,
          },
        };
      });
    }
    return api.get('/persons/mine');
  },
  getPersons: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockUsers,
        },
      }));
    }
    return api.get('/persons');
  },
  getMyProjects: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockProjects.filter(p => p.status === 1),
        },
      }));
    }
    return api.get('/projects/my');
  },
  getAllProjects: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockProjects,
        },
      }));
    }
    return api.get('/projects/all');
  },
  getMyAttendance: (params) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: [
            { date: '2026-04-28', checkIn: '08:30', checkOut: '18:00', status: '正常' },
            { date: '2026-04-27', checkIn: '08:45', checkOut: '18:30', status: '正常' },
            { date: '2026-04-26', checkIn: '09:00', checkOut: '18:00', status: '迟到' },
          ],
        },
      }));
    }
    return api.get('/attendance/my', { params });
  },
  getDeptAttendance: (params) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: [],
        },
      }));
    }
    return api.get('/attendance/dept', { params });
  },
  getPendingOaProcesses: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: [],
        },
      }));
    }
    return api.get('/oa-processes/pending');
  },
  simulateOaProcess: (data) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          message: '模拟成功',
        },
      }));
    }
    return api.post('/oa-processes/simulate', data);
  },
};

export const statisticsAPI = {
  getPersonalStatistics: (params) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: {
            totalHours: 168,
            projectCount: 5,
            avgHoursPerDay: 7.5,
            monthlyData: [
              { month: '2026-01', hours: 176 },
              { month: '2026-02', hours: 160 },
              { month: '2026-03', hours: 184 },
              { month: '2026-04', hours: 168 },
            ],
            projectDistribution: [
              { projectCode: 'PRJ001', projectName: '智能工厂系统', hours: 64 },
              { projectCode: 'PRJ002', projectName: '数据中台项目', hours: 48 },
              { projectCode: 'PRJ003', projectName: '移动办公平台', hours: 32 },
              { projectCode: 'PRJ004', projectName: '智慧城市项目', hours: 24 },
            ],
          },
        },
      }));
    }
    return api.get('/statistics/personal', { params });
  },
  getCompanyStatistics: () => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const totalHours = mockWorkHours.reduce((sum, item) => sum + (item.workHours || 0), 0);
        const normalHours = mockWorkHours.filter(w => !w.workType || w.workType === 'normal').reduce((sum, item) => sum + (item.workHours || 0), 0);
        const overtimeHours = mockWorkHours.filter(w => w.workType === 'overtime').reduce((sum, item) => sum + (item.workHours || 0), 0);
        const approvedCount = mockWorkHours.filter(w => w.status === 'Approved').length;
        const submittedCount = mockWorkHours.filter(w => w.status === 'Submitted').length;
        
        const personStats = {};
        mockWorkHours.forEach(item => {
          if (!personStats[item.personName]) {
            personStats[item.personName] = {
              name: item.personName,
              department: item.departmentName,
              totalHours: 0,
              normalHours: 0,
              overtimeHours: 0,
              count: 0,
            };
          }
          personStats[item.personName].totalHours += (item.workHours || 0);
          personStats[item.personName].count++;
          if (item.workType === 'overtime') {
            personStats[item.personName].overtimeHours += (item.workHours || 0);
          } else {
            personStats[item.personName].normalHours += (item.workHours || 0);
          }
        });
        
        const departmentStats = {};
        mockWorkHours.forEach(item => {
          if (!departmentStats[item.departmentName]) {
            departmentStats[item.departmentName] = {
              name: item.departmentName,
              totalHours: 0,
              employeeCount: 0,
            };
          }
          departmentStats[item.departmentName].totalHours += (item.workHours || 0);
        });
        
        const projectStats = {};
        mockWorkHours.forEach(item => {
          if (!projectStats[item.projectName]) {
            projectStats[item.projectName] = {
              name: item.projectName,
              totalHours: 0,
              count: 0,
            };
          }
          projectStats[item.projectName].totalHours += (item.workHours || 0);
          projectStats[item.projectName].count++;
        });
        
        return {
          data: {
            code: 200,
            data: {
              totalHours: totalHours.toFixed(1),
              normalHours: normalHours.toFixed(1),
              overtimeHours: overtimeHours.toFixed(1),
              employeeCount: mockUsers.filter(u => u.role === 'Employee').length,
              totalRecords: mockWorkHours.length,
              approvedCount,
              submittedCount,
              personList: Object.values(personStats),
              departmentList: Object.values(departmentStats),
              projectList: Object.values(projectStats),
            },
          },
        };
      });
    }
    return api.get('/statistics/company');
  },
  getDepartmentStatistics: (params) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: {
            totalHours: 1680,
            memberCount: 10,
            avgHoursPerPerson: 168,
            memberData: [
              { personCode: 'EMP001', personName: '张三', hours: 168 },
              { personCode: 'EMP002', personName: '李四', hours: 176 },
              { personCode: 'EMP003', personName: '王五', hours: 160 },
            ],
          },
        },
      }));
    }
    return api.get('/statistics/department', { params });
  },
  getProjectStatistics: (code, params) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: {
            totalHours: 320,
            memberCount: 4,
            avgHoursPerPerson: 80,
            memberData: [
              { personCode: 'EMP001', personName: '张三', hours: 80 },
              { personCode: 'EMP002', personName: '李四', hours: 80 },
              { personCode: 'EMP003', personName: '王五', hours: 80 },
              { personCode: 'EMP004', personName: '赵六', hours: 80 },
            ],
          },
        },
      }));
    }
    return api.get(`/statistics/project/${code}`, { params });
  },
};

export const syncAPI = {
  getStatus: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: {
            isRunning: false,
            lastSyncTime: '2026-04-29 08:00:00',
            nextSyncTime: '2026-04-29 09:00:00',
            syncInterval: 60,
            totalRecords: 1256,
            lastSyncStatus: '成功',
          },
        },
      }));
    }
    return api.get('/sync/status');
  },
  manualSync: () => {
    if (USE_MOCK) {
      return mockRequest(() => {
        const newLog = {
          id: mockSyncLogs.length + 1,
          syncTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
          syncType: '手动同步',
          status: '成功',
          recordCount: Math.floor(Math.random() * 100) + 50,
          duration: `${(Math.random() * 2 + 1).toFixed(1)}s`,
        };
        mockSyncLogs.unshift(newLog);
        return {
          data: {
            code: 200,
            message: '同步成功',
            data: newLog,
          },
        };
      });
    }
    return api.post('/sync/manual');
  },
  getLogs: (params) => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockSyncLogs.slice(0, params?.limit || 20),
        },
      }));
    }
    return api.get('/sync/logs', { params });
  },
  getStatistics: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: {
            totalSyncs: 156,
            successCount: 152,
            failedCount: 4,
            totalRecords: 12560,
            avgDuration: '2.1s',
          },
        },
      }));
    }
    return api.get('/sync/statistics');
  },
};

export const projectAPI = {
  getProjects: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockProjects.filter(p => p.status === 1),
        },
      }));
    }
    return api.get('/projects/my');
  },
  getAllProjects: () => {
    if (USE_MOCK) {
      return mockRequest(() => ({
        data: {
          code: 200,
          data: mockProjects,
        },
      }));
    }
    return api.get('/projects/all');
  },
};

export { mockProjects };
export default api;
