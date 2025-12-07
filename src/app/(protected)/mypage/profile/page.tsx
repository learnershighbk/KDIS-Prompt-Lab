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
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

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
  const { t } = useTranslation();
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
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('profile.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('profile.profilePhoto')}</CardTitle>
            <CardDescription>
              {t('profile.changeProfileImage')}
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
              {t('profile.changeImage')}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.basicInfo')}</CardTitle>
            <CardDescription>
              {t('profile.enterPersonalInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('profile.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder={t('profile.enterName')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
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
                  {t('profile.emailCannotBeChanged')}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">{t('profile.department')}</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger id="department">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t('profile.selectDepartment')} />
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
                <Label htmlFor="program">{t('profile.program')}</Label>
                <Select
                  value={formData.program}
                  onValueChange={(value) => handleInputChange('program', value)}
                >
                  <SelectTrigger id="program">
                    <SelectValue placeholder={t('profile.selectProgram')} />
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
              <Label htmlFor="studentId">{t('profile.studentId')}</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                placeholder={t('profile.enterStudentId')}
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-pulse" />
                    {t('profile.saving')}
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t('profile.saved')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('profile.save')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.accountSettings')}</CardTitle>
          <CardDescription>
            {t('profile.manageAccountSettings')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">{t('profile.changePassword')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('profile.changeAccountPassword')}
              </p>
            </div>
            <Button variant="outline">{t('profile.change')}</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">{t('profile.notificationSettings')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('profile.manageNotifications')}
              </p>
            </div>
            <Button variant="outline">{t('profile.configure')}</Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-destructive">{t('profile.deleteAccount')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('profile.permanentlyDeleteAccount')}
              </p>
            </div>
            <Button variant="destructive">{t('profile.delete')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
