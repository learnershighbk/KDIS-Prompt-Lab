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
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

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
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'OpenAI 프롬프트 엔지니어링 가이드',
    description: 'OpenAI 공식 문서 기반의 프롬프트 작성 가이드입니다.',
    type: 'document',
    category: '기초',
    url: 'https://platform.openai.com/docs/guides/prompt-engineering',
  },
  {
    id: '2',
    title: 'Anthropic Claude 공식 프롬프트 가이드',
    description: 'Claude 모델의 특성과 효과적인 프롬프트 작성법을 설명하는 공식 가이드입니다.',
    type: 'link',
    category: '기초',
    url: 'https://docs.anthropic.com/claude/docs/intro-to-prompting',
  },
  {
    id: '3',
    title: '체인 오브 쏘트(Chain of Thought) 프롬프팅',
    description: '복잡한 추론 작업을 위한 단계적 사고 유도 기법을 설명합니다.',
    type: 'article',
    category: '심화',
    url: 'https://www.promptingguide.ai/techniques/cot',
  },
  {
    id: '4',
    title: 'Few-shot Learning 프롬프트 전략',
    description: '예시를 활용하여 AI의 출력 품질을 높이는 방법을 다룹니다.',
    type: 'document',
    category: '심화',
    url: 'https://www.promptingguide.ai/techniques/fewshot',
  },
  {
    id: '5',
    title: 'AI 윤리와 책임있는 사용',
    description: 'AI 활용 시 고려해야 할 윤리적 측면과 모범 사례를 소개합니다.',
    type: 'article',
    category: '기초',
    url: 'https://www.anthropic.com/responsible-ai',
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

const getTypeBadge = (type: Resource['type'], t: ReturnType<typeof useTranslation>['t']) => {
  const typeLabels = {
    article: t('resources.article'),
    video: t('resources.video'),
    document: t('resources.document'),
    link: t('resources.externalLink'),
  };
  return typeLabels[type];
};

export default function ResourcesPage({ params }: ResourcesPageProps) {
  void params;
  const { t } = useTranslation();
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
        <h1 className="text-3xl font-bold">{t('resources.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('resources.description')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('resources.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('resources.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('resources.allTypes')}</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeBadge(type, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('resources.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('resources.allCategories')}</SelectItem>
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
        {t('resources.totalResources', { count: filteredResources.length })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getTypeIcon(resource.type)}
                  <Badge variant="outline" className="text-xs">
                    {getTypeBadge(resource.type, t)}
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
                    {t('resources.open')}
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
          <h3 className="text-lg font-medium">{t('resources.noResults')}</h3>
          <p className="text-muted-foreground mt-1">
            {t('resources.tryDifferentSearch')}
          </p>
        </div>
      )}
    </div>
  );
}
