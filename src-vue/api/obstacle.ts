// 阻碍识别相关API

export interface ObstacleRecord {
  id: number;
  type: string;
  content: string;
  status: 'unresolved' | 'resolved';
  userId: string;
  userName: string;
  time: string;
  relativeTime: string;
  resolvedTime?: string;
  priority?: 'high' | 'medium' | 'low';
  assignee?: string;
  solution?: string;
  notes?: string;
}

export interface ResolveRequest {
  id: number;
  solution: string;
  notes?: string;
}

export interface AssignRequest {
  id: number;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface ObstacleListResponse {
  data: ObstacleRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ObstacleFilter {
  status?: 'all' | 'unresolved' | 'resolved';
  page?: number;
  pageSize?: number;
  keyword?: string;
}

/**
 * 获取阻碍记录列表
 */
export async function getObstacleList(filter: ObstacleFilter = {}): Promise<ObstacleListResponse> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // 模拟数据
  const mockData: ObstacleRecord[] = [
    {
      id: 1,
      type: '饮食打卡阻碍',
      content: '喝饮料喝多少合适',
      status: 'unresolved',
      userId: 'U001',
      userName: '张三',
      time: '2025-04-09 14:30',
      relativeTime: '13分钟前'
    },
    {
      id: 2,
      type: '运动打卡阻碍',
      content: '工作太忙，没有时间运动',
      status: 'unresolved',
      userId: 'U002',
      userName: '李四',
      time: '2025-04-09 13:15',
      relativeTime: '1小时前'
    },
    {
      id: 3,
      type: '睡眠记录阻碍',
      content: '失眠导致无法按时记录睡眠时间',
      status: 'unresolved',
      userId: 'U003',
      userName: '王五',
      time: '2025-04-09 10:20',
      relativeTime: '4小时前'
    },
    {
      id: 4,
      type: '饮食打卡阻碍',
      content: '不清楚食物的热量计算方法',
      status: 'resolved',
      userId: 'U004',
      userName: '赵六',
      time: '2025-04-08 16:45',
      relativeTime: '昨天',
      resolvedTime: '今天 09:30'
    }
  ];

  // 生成更多测试数据
  for (let i = 5; i <= 45; i++) {
    const isUnresolved = Math.random() > 0.3;
    mockData.push({
      id: i,
      type: ['饮食打卡阻碍', '运动打卡阻碍', '睡眠记录阻碍', '体重记录阻碍'][Math.floor(Math.random() * 4)],
      content: `阻碍记录示例内容 ${i} - 这是一个自动生成的测试数据`,
      status: isUnresolved ? 'unresolved' : 'resolved',
      userId: `U${String(i).padStart(3, '0')}`,
      userName: `用户${i}`,
      time: `2025-04-${Math.max(1, 9 - Math.floor(i / 5))} ${10 + (i % 10)}:${15 + (i % 4) * 10}`,
      relativeTime: `${Math.floor(Math.random() * 7) + 1}天前`,
      resolvedTime: isUnresolved ? undefined : `${Math.floor(Math.random() * 24)}小时前`
    });
  }

  // 应用筛选
  let filteredData = mockData;
  if (filter.status && filter.status !== 'all') {
    filteredData = mockData.filter(item => item.status === filter.status);
  }

  if (filter.keyword) {
    filteredData = filteredData.filter(item =>
      item.content.includes(filter.keyword!) ||
      item.type.includes(filter.keyword!) ||
      item.userName.includes(filter.keyword!)
    );
  }

  // 分页
  const page = filter.page || 1;
  const pageSize = filter.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    pageSize
  };
}

/**
 * 标记阻碍为已解决
 */
export async function resolveObstacle(id: number): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: 实际项目中这里应该调用真实的API
  console.log(`解决阻碍记录: ${id}`);

  return true;
}

/**
 * 批量解决阻碍
 */
export async function batchResolveObstacles(ids: number[]): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  // TODO: 实际项目中这里应该调用真实的API
  console.log(`批量解决阻碍记录: ${ids.join(', ')}`);

  return true;
}

/**
 * 删除阻碍记录
 */
export async function deleteObstacle(id: number): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // TODO: 实际项目中这里应该调用真实的API
  console.log(`删除阻碍记录: ${id}`);

  return true;
}

/**
 * 获取阻碍统计信息
 */
export async function getObstacleStats(): Promise<{
  total: number;
  unresolved: number;
  resolved: number;
  todayNew: number;
}> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 200));

  // TODO: 实际项目中这里应该调用真实的API
  return {
    total: 442,
    unresolved: 128,
    resolved: 314,
    todayNew: 10
  };
}

/**
 * 解决阻碍（带解决方案）
 */
export async function resolveObstacleWithSolution(request: ResolveRequest): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: 实际项目中这里应该调用真实的API
  console.log('解决阻碍:', request);

  return true;
}

/**
 * 分配阻碍处理人
 */
export async function assignObstacle(request: AssignRequest): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // TODO: 实际项目中这里应该调用真实的API
  console.log('分配阻碍:', request);

  return true;
}

/**
 * 批量分配阻碍
 */
export async function batchAssignObstacles(requests: AssignRequest[]): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  // TODO: 实际项目中这里应该调用真实的API
  console.log('批量分配阻碍:', requests);

  return true;
}

/**
 * 获取阻碍详情
 */
export async function getObstacleDetail(id: number): Promise<ObstacleRecord | null> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 200));

  // TODO: 实际项目中这里应该调用真实的API
  const mockDetail: ObstacleRecord = {
    id: id,
    type: '饮食打卡阻碍',
    content: '喝饮料喝多少合适',
    status: 'unresolved',
    userId: 'U001',
    userName: '张三',
    time: '2025-04-09 14:30',
    relativeTime: '13分钟前',
    priority: 'high',
    assignee: '教练A',
    solution: '',
    notes: ''
  };

  return mockDetail;
}

/**
 * 获取阻碍处理历史
 */
export async function getObstacleHistory(id: number): Promise<{
  id: number;
  action: string;
  operator: string;
  time: string;
  details: string;
}[]> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 200));

  // TODO: 实际项目中这里应该调用真实的API
  return [
    {
      id: 1,
      action: '创建',
      operator: '系统',
      time: '2025-04-09 14:30',
      details: '用户提交阻碍反馈'
    },
    {
      id: 2,
      action: '分配',
      operator: '管理员',
      time: '2025-04-09 14:35',
      details: '分配给教练A处理，优先级设为紧急'
    }
  ];
}

/**
 * 搜索阻碍记录
 */
export async function searchObstacles(keyword: string, filters?: {
  type?: string;
  priority?: string;
  status?: string;
}): Promise<ObstacleRecord[]> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // TODO: 实际项目中这里应该调用真实的API
  const allData = await getObstacleList();
  let results = allData.data;

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    results = results.filter(item =>
      item.content.toLowerCase().includes(lowerKeyword) ||
      item.type.toLowerCase().includes(lowerKeyword) ||
      item.userName.toLowerCase().includes(lowerKeyword)
    );
  }

  if (filters?.type) {
    results = results.filter(item => item.type === filters.type);
  }

  if (filters?.priority) {
    results = results.filter(item => item.priority === filters.priority);
  }

  if (filters?.status) {
    results = results.filter(item => item.status === filters.status);
  }

  return results;
}

/**
 * 导出阻碍记录
 */
export async function exportObstacles(filters?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: 实际项目中这里应该调用真实的API
  const csvContent = 'ID,类型,内容,状态,用户,时间\n1,饮食打卡阻碍,喝饮料喝多少合适,未解决,张三,2025-04-09 14:30';
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
