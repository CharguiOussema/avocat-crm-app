import { Controller, useFormContext } from 'react-hook-form';
import { Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface LoginFormData {
  email: string;
  password: string;
}

function PasswordForm() {
  const { control } = useFormContext<LoginFormData>();
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="password"
      rules={{
        required: t('login.passwordRequired', 'Password is required'),
        minLength: {
          value: 6,
          message: t('login.passwordMinLength', 'Password must be at least 6 characters')
        }
      }}
      defaultValue=""
      render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {t('login.password', 'Password')}
          </label>
          <Input.Password
            id="password"
            ref={ref}
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('login.passwordPlaceholder', 'Enter your password')}
            size="large"
            status={fieldState.error ? 'error' : ''}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
          />
          {fieldState.error && (
            <span className="text-red-500 text-sm mt-1 block">
              {fieldState.error.message}
            </span>
          )}
        </div>
      )}
    />
  );
}

export default PasswordForm;