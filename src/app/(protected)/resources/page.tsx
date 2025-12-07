'use client';

import { useState } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Filter,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ResourcesPageProps = {
  params: Promise<Record<string, never>>;
};

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'document' | 'link';
  category: string;
  url: string;
  duration?: string;
  moduleId?: string;
}

const resources: Resource[] = [
  {
    id: '1',
    title: '프롬프트 엔지니어링 기초 가이드',
    description: 'AI와 효과적으로 대화하기 위한 기본 원칙과 테크닉을 소개합니다.',
    type: 'article',
    category: '기초',
    url: '#',
    moduleId: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: '2',
    title: 'ChatGPT 프롬프트 작성 베스트 프랙티스',
    description: 'OpenAI 공식 문서 기반의 프롬프트 작성 가이드입니다.',
    type: 'document',
    category: '기초',
    url: '#',
    moduleId: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: '3',
    title: '학술 연구를 위한 AI 활용법',
    description: '문헌 리뷰, 연구 설계, 데이터 분석 등 학술 연구에 AI를 활용하는 방법을 다룹니다.',
    type: 'video',
    category: '심화',
    url: '#',
    duration: '25분',
    moduleId: '22222222-2222-2222-2222-222222222222',
  },
  {
    id: '4',
    title: '정책 분석가를 위한 프롬프트 가이드',
    description: '정책 비교, 영향 분석, 시나리오 플래닝 등에 활용할 수 있는 프롬프트 템플릿입니다.',
    type: 'document',
    category: '실무',
    url: '#',
    moduleId: '33333333-3333-3333-3333-333333333333',
  },
  {
    id: '5',
    title: '데이터 시각화를 위한 AI 프롬프트',
    description: '차트 생성, 데이터 해석, 인사이트 도출에 효과적인 프롬프트 예시를 제공합니다.',
    type: 'article',
    category: '실무',
    url: '#',
    moduleId: '44444444-4444-4444-4444-444444444444',
  },
  {
    id: '6',
    title: '보고서 작성 자동화 튜토리얼',
    description: 'AI를 활용한 보고서 구조화, 초안 작성, 교정 과정을 단계별로 안내합니다.',
    type: 'video',
    category: '심화',
    url: '#',
    duration: '35분',
    moduleId: '55555555-5555-5555-5555-555555555555',
  },
  {
    id: '7',
    title: 'Anthropic Claude 공식 프롬프트 가이드',
    description: 'Claude 모델의 특성과 효과적인 프롬프트 작성법을 설명하는 공식 가이드입니다.',
    type: 'link',
    category: '기초',
    url: 'https://docs.anthropic.com/claude/docs/intro-to-prompting',
  },
  {
    id: '8',
    title: '체인 오브 쏘트(Chain of Thought) 프롬프팅',
    description: '복잡한 추론 작업을 위한 단계적 사고 유도 기법을 설명합니다.',
    type: 'article',
    category: '심화',
    url: '#',
  },
  {
    id: '9',
    title: 'Few-shot Learning 프롬프트 전략',
    description: '예시를 활용하여 AI의 출력 품질을 높이는 방법을 다룹니다.',
    type: 'document',
    category: '심화',
    url: '#',
  },
  {
    id: '10',
    title: 'AI 윤리와 책임있는 사용',
    description: 'AI 활용 시 고려해야 할 윤리적 측면과 모범 사례를 소개합니다.',
    type: 'article',
    category: '기초',
    url: '#',
  },
];

const getTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'article':
      return <BookOpen className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'link':
      return <LinkIcon className="h-5 w-5" />;
  }
};

const getTypeBadge = (type: Resource['type']) => {
  const typeLabels = {
    article: '아티클',
    video: '동영상',
    document: '문서',
    link: '외부 링크',
  };
  return typeLabels[type];
};

export default function ResourcesPage({ params }: ResourcesPageProps) {
  void params;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesCategory =
      categoryFilter === 'all' || resource.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = [...new Set(resources.map((r) => r.category))];
  const types = [...new Set(resources.map((r) => r.type))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">학습 리소스</h1>
        <p className="text-muted-foreground mt-1">
          프롬프트 엔지니어링 학습에 도움이 되는 다양한 자료를 제공합니다
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="리소스 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 유형</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeBadge(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 카테고리</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        총 {filteredResources.length}개의 리소스
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getTypeIcon(resource.type)}
                  <Badge variant="outline" className="text-xs">
                    {getTypeBadge(resource.type)}
                  </Badge>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {resource.category}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex items-center justify-between">
                {resource.duration && (
                  <span className="text-sm text-muted-foreground">
                    {resource.duration}
                  </span>
                )}
                <Button variant="outline" size="sm" asChild className="ml-auto">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    열기
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">검색 결과가 없습니다</h3>
          <p className="text-muted-foreground mt-1">
            다른 검색어나 필터를 시도해보세요
          </p>
        </div>
      )}
    </div>
  );
}
