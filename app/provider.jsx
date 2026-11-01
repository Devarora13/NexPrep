"use client";
import { UserDetailContext } from "@/context/UserDetail.context";
import { supabase } from "@/services/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Provider({ children }) {
  const [user, setUser] = React.useState(null);
  const [authUser, setAuthUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Provider mounted
    let isMounted = true;

    handleAuthAndUser().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          void handleAuthAndUser();
        }, 0);
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isProtectedRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/all-interviews") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/logout") ||
      pathname.startsWith("/interview");

    if (!authUser && isProtectedRoute) {
      router.replace("/auth");
    } else if (authUser && pathname === "/auth") {
      router.replace("/dashboard");
    }
  }, [authUser, isLoading, pathname, router]);

  const handleAuthAndUser = async () => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        // User not authenticated
        return;
      }

      setAuthUser(authData.user);
      const userEmail = authData.user.email;
      // Authenticated user found

      const { data: existingUser, error: fetchError } = await supabase
        .from("Users")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle();

      if (fetchError) {
        console.error("Unable to load the user profile from Supabase.", fetchError);
        setUser({
          Name:
            authData.user.user_metadata?.full_name ||
            authData.user.user_metadata?.name ||
            userEmail.split("@")[0],
          email: userEmail,
          pfp: authData.user.user_metadata?.picture || null,
          credits: 0,
        });
        return;
      }

      if (!existingUser) {
        // User not found, creating new user
        const { data: insertedUser, error: insertError } = await supabase
          .from("Users")
          .insert([
            {
              Name:
                authData.user.user_metadata?.full_name ||
                authData.user.user_metadata?.name ||
                userEmail.split("@")[0],
              email: userEmail,
              pfp: authData.user.user_metadata?.picture || null,
              credits: 1, // Give 1 free credit to new users
            },
          ])
          .select()
          .single(); // fetch inserted row

        if (insertError) {
          console.error("Unable to create the user profile in Supabase.", insertError);
          setUser({
            Name:
              authData.user.user_metadata?.full_name ||
              authData.user.user_metadata?.name ||
              userEmail.split("@")[0],
            email: userEmail,
            pfp: authData.user.user_metadata?.picture || null,
            credits: 0,
          });
          return;
        }

        setUser(insertedUser);
      } else {
        setUser(existingUser);
      }

    } catch (err) {
      console.error("Unexpected error while loading the authenticated user.", err);
    }
  };

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUser = () => {
  const context = React.useContext(UserDetailContext);
  return context;
};
