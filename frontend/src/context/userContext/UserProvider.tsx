import {ReactNode, useCallback, useEffect, useState,} from "react";

import {ApiResObj} from "../../providers/userProvider.ts";
import {UserContext} from "./userContextImport.ts";

export interface UserNamePassword {
  readonly userName: string;
  readonly password: string;
}

export interface User {
  readonly userName: string
}

const getToken = () => window.localStorage.getItem("token");
const setToken = (token: string) => window.localStorage.setItem("token", token);

interface Props {
  children: ReactNode
}

const UserProvider = ({children}: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getMe = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/user/me", {
        headers: {
          authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const user: User = await response.json();

      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    getMe(token);
  }, []);

  async function login(creds: UserNamePassword): Promise<ApiResObj> {
    const httpRes: Response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creds)
    });
    const token = httpRes.headers.get("Authorization");
    if (httpRes.ok) {
      if (token) {
        setToken(token);
        getMe(token);
      }
    }
    return {status: httpRes.status, body: null, headers: httpRes.headers};
  }

  const logout = () => {
    setUser(null);
    setToken("");
  }

  return (
      <UserContext.Provider value={{user, login, logout}}>
        {!loading && children}
      </UserContext.Provider>
  );
};

export default UserProvider;
