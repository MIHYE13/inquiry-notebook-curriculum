import { Curriculum, CurriculumLesson } from '../types';

// 진도표 샘플 데이터 (실제로는 PDF 파싱 필요)
export const SAMPLE_CURRICULUM_4_1: Curriculum = {
  id: 'curriculum-4-1-2025',
  name: '2025년도 4학년 1학기 과학',
  grade: '4학년',
  subject: '과학',
  semester: '1학기',
  createdAt: new Date().toISOString(),
  createdBy: '',
  lessons: [
    // 힘과 우리 생활
    {
      id: 'lesson-001',
      unit: '힘과 우리 생활',
      topic: '밀거나 당기며 느끼는 힘',
      period: 1,
      keywords: ['힘', '밀기', '당기기'],
      learningGoals: '밀거나 당기는 힘을 느끼고 표현할 수 있다.',
      order: 1
    },
    {
      id: 'lesson-002',
      unit: '힘과 우리 생활',
      topic: '오르락내리락, 어느 것이 더 무거울까?',
      period: 2,
      keywords: ['무게', '비교', '시소'],
      learningGoals: '물체의 무게를 비교할 수 있다.',
      order: 2
    },
    {
      id: 'lesson-003',
      unit: '힘과 우리 생활',
      topic: '도전, 무게를 정확히 비교하라!',
      period: 3,
      keywords: ['무게', '측정', '비교'],
      order: 3
    },
    {
      id: 'lesson-004',
      unit: '힘과 우리 생활',
      topic: '용수철저울로 무게를 비교하라!',
      period: 4,
      keywords: ['용수철저울', '무게', '측정'],
      order: 4
    },
    {
      id: 'lesson-005',
      unit: '힘과 우리 생활',
      topic: '작은 힘으로 물체를 들어 올리는 도구의 비밀',
      period: 5,
      keywords: ['도구', '지레', '힘'],
      order: 5
    },
    {
      id: 'lesson-006',
      unit: '힘과 우리 생활',
      topic: '일상생활에서 이용하는 도구를 찾아라!',
      period: 6,
      keywords: ['도구', '생활', '활용'],
      order: 6
    },
    
    // 물의 상태 변화
    {
      id: 'lesson-007',
      unit: '물의 상태 변화',
      topic: '물의 상태가 변할 수 있다고?',
      period: 1,
      keywords: ['물', '상태', '변화'],
      learningGoals: '물의 세 가지 상태를 이해한다.',
      order: 7
    },
    {
      id: 'lesson-008',
      unit: '물의 상태 변화',
      topic: '물이 얼 때와 얼음이 녹을 때 어떤 일이 일어날까?',
      period: 2,
      keywords: ['얼음', '얼기', '녹기'],
      order: 8
    },
    {
      id: 'lesson-009',
      unit: '물의 상태 변화',
      topic: '물이 증발할 때와 끓을 때 어떤 일이 일어날까?',
      period: 3,
      keywords: ['증발', '끓음', '수증기'],
      order: 9
    },
    {
      id: 'lesson-010',
      unit: '물의 상태 변화',
      topic: '차가운 물체 표면에 어떤 일이 일어날까?',
      period: 4,
      keywords: ['응결', '이슬', '물방울'],
      order: 10
    },
    {
      id: 'lesson-011',
      unit: '물의 상태 변화',
      topic: '물을 얻는 방법을 조사하자!',
      period: 5,
      keywords: ['물', '얻기', '방법'],
      order: 11
    },
    
    // 땅의 변화
    {
      id: 'lesson-012',
      unit: '땅의 변화',
      topic: '화산이 궁금해!',
      period: 3,
      keywords: ['화산', '마그마', '분출'],
      learningGoals: '화산의 구조와 분출 과정을 이해한다.',
      order: 12
    },
    {
      id: 'lesson-013',
      unit: '땅의 변화',
      topic: '화산 활동 모형을 만들자!',
      period: 4,
      keywords: ['화산', '모형', '실험'],
      order: 13
    },
    {
      id: 'lesson-014',
      unit: '땅의 변화',
      topic: '화강암과 현무암은 어떻게 다를까?',
      period: 5,
      keywords: ['화강암', '현무암', '화성암'],
      order: 14
    },
    {
      id: 'lesson-015',
      unit: '땅의 변화',
      topic: '화산 활동은 우리에게 해로울까, 이로울까?',
      period: 6,
      keywords: ['화산', '영향', '이로움', '해로움'],
      order: 15
    },
    {
      id: 'lesson-016',
      unit: '땅의 변화',
      topic: '지진은 우리에게 어떤 영향을 줄까?',
      period: 7,
      keywords: ['지진', '영향', '대처'],
      order: 16
    },
    
    // 식물의 생활
    {
      id: 'lesson-017',
      unit: '식물의 생활',
      topic: '식물 탐험대, 식물을 분류하라!',
      period: 1,
      keywords: ['식물', '분류', '특징'],
      learningGoals: '식물을 특징에 따라 분류할 수 있다.',
      order: 17
    },
    {
      id: 'lesson-018',
      unit: '식물의 생활',
      topic: '우리 주변에는 어떤 식물이 살까?',
      period: 2,
      keywords: ['식물', '환경', '주변'],
      order: 18
    },
    {
      id: 'lesson-019',
      unit: '식물의 생활',
      topic: '물에는 어떤 식물이 살까?',
      period: 3,
      keywords: ['물', '식물', '수생식물'],
      order: 19
    },
    {
      id: 'lesson-020',
      unit: '식물의 생활',
      topic: '사막이나 높은 산에는 어떤 식물이 살까?',
      period: 4,
      keywords: ['사막', '산', '식물', '적응'],
      order: 20
    },
    {
      id: 'lesson-021',
      unit: '식물의 생활',
      topic: '식물의 특징을 이용한 생활용품을 찾아라!',
      period: 6,
      keywords: ['식물', '생활용품', '활용'],
      order: 21
    },
    
    // 생물의 한살이
    {
      id: 'lesson-022',
      unit: '생물의 한살이',
      topic: '씨가 싹 트려면 어떤 조건이 필요할까?',
      period: 4,
      keywords: ['씨앗', '싹트기', '조건'],
      learningGoals: '씨가 싹트는 조건을 실험으로 알아본다.',
      order: 22
    },
    {
      id: 'lesson-023',
      unit: '생물의 한살이',
      topic: '식물이 쑥쑥 잘 자라게 하려면?',
      period: 5,
      keywords: ['식물', '성장', '조건'],
      order: 23
    },
    {
      id: 'lesson-024',
      unit: '생물의 한살이',
      topic: '다양한 식물의 한살이를 알아볼까?',
      period: 7,
      keywords: ['식물', '한살이', '생장'],
      order: 24
    },
    
    // 다양한 생물과 우리 생활
    {
      id: 'lesson-025',
      unit: '다양한 생물과 우리 생활',
      topic: '버섯과 곰팡이의 정체를 밝혀라!',
      period: 1,
      keywords: ['버섯', '곰팡이', '균류'],
      learningGoals: '버섯과 곰팡이의 특징을 관찰한다.',
      order: 25
    },
    {
      id: 'lesson-026',
      unit: '다양한 생물과 우리 생활',
      topic: '해캄과 짚신벌레는 어떤 생물일까?',
      period: 2,
      keywords: ['해캄', '짚신벌레', '미생물'],
      order: 26
    },
    {
      id: 'lesson-027',
      unit: '다양한 생물과 우리 생활',
      topic: '세균이 궁금해!',
      period: 3,
      keywords: ['세균', '미생물', '관찰'],
      order: 27
    },
    {
      id: 'lesson-028',
      unit: '다양한 생물과 우리 생활',
      topic: '다양한 생물은 우리 생활에 어떤 영향을 줄까?',
      period: 4,
      keywords: ['생물', '영향', '생활'],
      order: 28
    },
    {
      id: 'lesson-029',
      unit: '다양한 생물과 우리 생활',
      topic: '생명 과학이 우리 생활에 이용되는 예를 찾아라!',
      period: 6,
      keywords: ['생명과학', '활용', '기술'],
      order: 29
    }
  ]
};

export const SAMPLE_CURRICULUM_4_2: Curriculum = {
  id: 'curriculum-4-2-2025',
  name: '2025년도 4학년 2학기 과학',
  grade: '4학년',
  subject: '과학',
  semester: '2학기',
  createdAt: new Date().toISOString(),
  createdBy: '',
  lessons: [
    // 밤하늘 관찰
    {
      id: 'lesson-101',
      unit: '밤하늘 관찰',
      topic: '달의 생김새가 궁금해!',
      period: 2,
      keywords: ['달', '관찰', '생김새'],
      learningGoals: '달의 생김새를 관찰하고 표현할 수 있다.',
      order: 1
    },
    {
      id: 'lesson-102',
      unit: '밤하늘 관찰',
      topic: '달의 모양을 여러 날 동안 관찰해 볼까?',
      period: 3,
      keywords: ['달', '모양', '변화'],
      order: 2
    },
    {
      id: 'lesson-103',
      unit: '밤하늘 관찰',
      topic: '태양계 구성원을 소개할게!',
      period: 4,
      keywords: ['태양계', '행성', '구성'],
      order: 3
    },
    {
      id: 'lesson-104',
      unit: '밤하늘 관찰',
      topic: '북극성 주변의 별자리를 찾아라!',
      period: 5,
      keywords: ['북극성', '별자리', '관찰'],
      order: 4
    },
    
    // 생물과 환경
    {
      id: 'lesson-105',
      unit: '생물과 환경',
      topic: '생태계가 궁금해!',
      period: 3,
      keywords: ['생태계', '생물', '환경'],
      learningGoals: '생태계의 구성 요소를 이해한다.',
      order: 5
    },
    {
      id: 'lesson-106',
      unit: '생물과 환경',
      topic: '생물 요소를 분류해 볼까?',
      period: 4,
      keywords: ['생물', '분류', '요소'],
      order: 6
    },
    {
      id: 'lesson-107',
      unit: '생물과 환경',
      topic: '생물의 먹고 먹히는 관계를 알아볼까?',
      period: 5,
      keywords: ['먹이사슬', '먹이그물', '관계'],
      order: 7
    },
    {
      id: 'lesson-108',
      unit: '생물과 환경',
      topic: '인간 활동은 생태계에 어떤 영향을 줄까?',
      period: 7,
      keywords: ['인간', '영향', '생태계'],
      order: 8
    },
    {
      id: 'lesson-109',
      unit: '생물과 환경',
      topic: '생태계 보전을 위해서 어떻게 해야 할까?',
      period: 8,
      keywords: ['생태계', '보전', '실천'],
      order: 9
    },
    
    // 여러 가지 기체
    {
      id: 'lesson-110',
      unit: '여러 가지 기체',
      topic: '보이지 않는 기체도 무게가 있을까?',
      period: 2,
      keywords: ['기체', '무게', '실험'],
      learningGoals: '기체의 무게를 측정할 수 있다.',
      order: 10
    },
    {
      id: 'lesson-111',
      unit: '여러 가지 기체',
      topic: '온도가 변하면 기체의 부피는 어떻게 될까?',
      period: 3,
      keywords: ['온도', '부피', '기체'],
      order: 11
    },
    {
      id: 'lesson-112',
      unit: '여러 가지 기체',
      topic: '압력이 변하면 기체의 부피는 어떻게 될까?',
      period: 4,
      keywords: ['압력', '부피', '기체'],
      order: 12
    },
    {
      id: 'lesson-113',
      unit: '여러 가지 기체',
      topic: '일상생활에서 이용되는 기체를 찾아라!',
      period: 5,
      keywords: ['기체', '활용', '생활'],
      order: 13
    },
    
    // 기후변화와 우리 생활
    {
      id: 'lesson-114',
      unit: '기후변화와 우리 생활',
      topic: '기후변화 현상의 예를 찾아라!',
      period: 2,
      keywords: ['기후변화', '현상', '관찰'],
      learningGoals: '기후변화의 예를 찾고 설명할 수 있다.',
      order: 14
    },
    {
      id: 'lesson-115',
      unit: '기후변화와 우리 생활',
      topic: '우리는 기후변화에 어떤 영향을 줄까?',
      period: 3,
      keywords: ['기후변화', '원인', '영향'],
      order: 15
    },
    {
      id: 'lesson-116',
      unit: '기후변화와 우리 생활',
      topic: '기후변화는 우리 생활과 환경에 어떤 영향을 줄까?',
      period: 4,
      keywords: ['기후변화', '영향', '환경'],
      order: 16
    },
    {
      id: 'lesson-117',
      unit: '기후변화와 우리 생활',
      topic: '기후변화에 어떻게 대응할 수 있을까?',
      period: 6,
      keywords: ['기후변화', '대응', '실천'],
      order: 17
    }
  ]
};

// 진도표 데이터 통합
export const ALL_CURRICULUMS = [
  SAMPLE_CURRICULUM_4_1,
  SAMPLE_CURRICULUM_4_2
];

// 유틸리티 함수들
export function getCurriculumById(id: string): Curriculum | undefined {
  return ALL_CURRICULUMS.find(c => c.id === id);
}

export function getLessonById(curriculumId: string, lessonId: string): CurriculumLesson | undefined {
  const curriculum = getCurriculumById(curriculumId);
  return curriculum?.lessons.find(l => l.id === lessonId);
}

export function getLessonsByUnit(curriculumId: string, unit: string): CurriculumLesson[] {
  const curriculum = getCurriculumById(curriculumId);
  return curriculum?.lessons.filter(l => l.unit === unit) || [];
}

export function getAllUnits(curriculumId: string): string[] {
  const curriculum = getCurriculumById(curriculumId);
  if (!curriculum) return [];
  
  const units = new Set<string>();
  curriculum.lessons.forEach(l => units.add(l.unit));
  return Array.from(units);
}
