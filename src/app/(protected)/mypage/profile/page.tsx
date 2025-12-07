'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  Save,
  Check,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/features/auth/stores/auth.store';

type ProfilePageProps = {
  params: Promise<Record<string, never>>;
};

const departments = [
  '공공정책대학원',
  '국제개발정책대학원',
  '경영대학원',
  '기타',
];

const programs = [
  'MPP (공공정책학 석사)',
  'MPM (공공관리학 석사)',
  'MDP (국제개발정책학 석사)',
  'MBA',
  '박사과정',
  '기타',
];

export default function ProfilePage({ params }: ProfilePageProps) {
  void params;
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    program: '',
    studentId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        department: '',
        program: '',
        studentId: '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="text-muted-foreground mt-1">
          개인 정보를 관리하고 업데이트하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>프로필 사진</CardTitle>
            <CardDescription>
              프로필 이미지를 변경하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.fullName ?? ''} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {user?.fullName?.charAt(0) ?? user?.email?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              이미지 변경
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              개인 정보와 학적 정보를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  이메일은 변경할 수 없습니다
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">소속</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger id="department">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="소속을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">프로그램</Label>
                <Select
                  value={formData.program}
                  onValueChange={(value) => handleInputChange('program', value)}
                >
                  <SelectTrigger id="program">
                    <SelectValue placeholder="프로그램을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((prog) => (
                      <SelectItem key={prog} value={prog}>
                        {prog}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">학번</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                placeholder="학번을 입력하세요 (선택)"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-pulse" />
                    저장 중...
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    저장됨
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장하기
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 설정</CardTitle>
          <CardDescription>
            계정 관련 설정을 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">비밀번호 변경</h4>
              <p className="text-sm text-muted-foreground">
                계정 비밀번호를 변경합니다
              </p>
            </div>
            <Button variant="outline">변경하기</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">알림 설정</h4>
              <p className="text-sm text-muted-foreground">
                이메일 및 앱 알림을 관리합니다
              </p>
            </div>
            <Button variant="outline">설정하기</Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-destructive">계정 삭제</h4>
              <p className="text-sm text-muted-foreground">
                계정을 영구적으로 삭제합니다
              </p>
            </div>
            <Button variant="destructive">삭제하기</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
