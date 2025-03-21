'use server'
import { signIn, signOut } from "@/auth";
// import { redirect } from "next/navigation";
export const signInWithGoogle = async () => {
    await signIn("google");
}

export const signinWithGitHub = async () => {
    await signIn("github",{ redirectTo: "/admin/posts" });
}

export const signinWithEmail = async (email: string) => {
    await signIn("nodemailer",{ email });
}

export const signout = async () => {
    await signOut();
}