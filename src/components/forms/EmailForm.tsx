import { Controller, useFormContext } from "react-hook-form";
import { Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface LoginFormData {
	email: string;
	password: string;
}

function EmailForm() {
	const { control } = useFormContext<LoginFormData>();
	const { t } = useTranslation();

	return (
		<Controller
			control={control}
			name='email'
			rules={{
				required: t("login.emailRequired", "Email is required"),
				pattern: {
					value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
					message: t("login.emailInvalid", "Invalid email address"),
				},
			}}
			defaultValue=''
			render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
				<div>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-700 mb-2'
					>
						{t("login.email", "Email Address")}
					</label>
					<Input
						id='email'
						ref={ref}
						type='email'
						prefix={<UserOutlined className='text-gray-400' />}
						placeholder={t("login.emailPlaceholder", "Enter your email")}
						size='large'
						status={fieldState.error ? "error" : ""}
						onChange={onChange}
						onBlur={onBlur}
						value={value}
						autoFocus
					/>
					{fieldState.error && (
						<span className='text-red-500 text-sm mt-1 block'>
							{fieldState.error.message}
						</span>
					)}
				</div>
			)}
		/>
	);
}

export default EmailForm;
