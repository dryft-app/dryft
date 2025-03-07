import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Card, CardContent } from "@repo/ui/components/card";
import { authClient } from "~/lib/auth-client";
import { SignupForm } from "./sign-up";
import { SignInForm } from "./sign-in";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// TypeScript types derived from schemas
type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;

function Auth() {
  const navigate = useNavigate();

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignupSubmit = async (formData: SignUpFormValues) => {
    try {
      const { data, error: authError } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (authError) {
        toast.error(authError.message || "Sign up failed");
        console.log(authError.message, "auth error");
        throw authError;
      }

      toast.success("Account created successfully");
      console.log("Sign up successful:", data);
    } catch (err) {
      console.error("Sign up error:", err);
    }
  };

  const handleSignInSubmit = async (formData: SignInFormValues) => {
    try {
      const { error: authError } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast.error(authError.message);
      } else {
        toast.success("Sign in successful");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Sign in failed");
      console.error("Sign in error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Tabs defaultValue="signup" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardContent className="p-0">
              <SignupForm
                form={signUpForm}
                onSubmit={signUpForm.handleSubmit(handleSignupSubmit)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signin">
          <Card>
            <CardContent className="p-0">
              <SignInForm
                form={signInForm}
                onSubmit={signInForm.handleSubmit(handleSignInSubmit)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Auth;
