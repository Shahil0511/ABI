import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { login, signup } from "@/services/authServices";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../../store/authSlice";

type FormErrors = Partial<FormType> & { submit?: string };
type FormField = "name" | "email" | "password";
type FormType = {
  name: string;
  email: string;
  password: string;
};

const SignupForm = () => {
  const [form, setForm] = useState<FormType>({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form | "submit", string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof typeof form, boolean>>
  >({});
  const [isLoginMode, setIsLoginMode] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    };
  };

  // Form validation
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!isLoginMode && !form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!isLoginMode && form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordValidation = validatePassword(form.password);

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!isLoginMode && !passwordValidation.isValid) {
      newErrors.password = "Password does not meet requirements";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as FormField;
    setForm((prev) => ({ ...prev, [fieldName]: value }));

    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldName = name as FormField;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLoginMode) {
        const data = await login({
          email: form.email,
          password: form.password,
        });

        dispatch(setCredentials({ token: data.token, user: data.user }));
        navigate("/dashboard");
      } else {
        const data = await signup({
          name: form.name,
          email: form.email,
          password: form.password,
        });

        dispatch(setCredentials({ token: data.token, user: data.user }));
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(
        isLoginMode ? "Login failed" : "Signup failed:",
        error.message
      );
      setErrors({
        submit:
          error.message ||
          (isLoginMode
            ? "Login failed. Please try again."
            : "Signup failed. Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form and errors when switching modes
    setForm({ name: "", email: "", password: "" });
    setErrors({});
    setTouched({});
  };

  const passwordValidation = validatePassword(form.password);
  const showPasswordRequirements =
    form.password && !passwordValidation.isValid && !isLoginMode;

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="sr-only">{isLoginMode ? "Login Form" : "Signup Form"}</h1>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isLoginMode ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isLoginMode
            ? "Sign in to continue"
            : "Join us today and get started"}
        </p>
      </div>

      {/* Form Card */}
      <div className="space-y-4">
        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
            <AlertCircle size={16} />
            {errors.submit}
          </div>
        )}

        {/* Name Field - only shown in signup mode */}
        {!isLoginMode && (
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2.5 border rounded-md text-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  errors.name && touched.name
                    ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              disabled={isLoading}
              required
              aria-invalid={errors.name && touched.name ? "true" : "false"}
              aria-describedby={
                errors.name && touched.name ? "name-error" : undefined
              }
            />
            {errors.name && touched.name && (
              <p
                id="name-error"
                className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <AlertCircle size={12} />
                {errors.name}
              </p>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2.5 border rounded-md text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                errors.email && touched.email
                  ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              }
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
            `}
            disabled={isLoading}
            required
            aria-invalid={errors.email && touched.email ? "true" : "false"}
            aria-describedby={
              errors.email && touched.email ? "email-error" : undefined
            }
          />
          {errors.email && touched.email && (
            <p
              id="email-error"
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle size={12} />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password *
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                isLoginMode ? "Enter your password" : "Create a secure password"
              }
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2.5 pr-10 border rounded-md text-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  errors.password && touched.password
                    ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              disabled={isLoading}
              required
              aria-invalid={
                errors.password && touched.password ? "true" : "false"
              }
              aria-describedby={
                errors.password && touched.password
                  ? "password-error"
                  : "password-requirements"
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:text-gray-700 dark:focus:text-gray-200 transition-colors p-1"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password Requirements - only shown in signup mode */}
          {showPasswordRequirements && (
            <div
              id="password-requirements"
              className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
            >
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password must contain:
              </p>
              <div className="space-y-1">
                {(
                  [
                    { key: "minLength", text: "At least 8 characters" },
                    { key: "hasUpper", text: "One uppercase letter" },
                    { key: "hasLower", text: "One lowercase letter" },
                    { key: "hasNumber", text: "One number" },
                    { key: "hasSpecial", text: "One special character" },
                  ] as { key: keyof typeof passwordValidation; text: string }[]
                ).map(({ key, text }) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {passwordValidation[key] ? (
                      <CheckCircle2
                        size={12}
                        className="text-green-500 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={
                        passwordValidation[key]
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.password && touched.password && (
            <p
              id="password-error"
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle size={12} />
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-2.5 px-4 text-sm font-medium text-white rounded-md transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            dark:focus:ring-offset-gray-800
            ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isLoginMode ? "Signing In..." : "Creating Account..."}
            </div>
          ) : isLoginMode ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>

        {/* Toggle between Login/Signup */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoginMode
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleLoginMode}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus:outline-none focus:underline transition-colors"
            >
              {isLoginMode ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
        By {isLoginMode ? "signing in" : "creating an account"}, you agree to
        our{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default SignupForm;
