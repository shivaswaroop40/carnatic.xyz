"use client";

import { createContext, useContext } from "react";

const AuthAvailableContext = createContext(false);

export function AuthAvailableProvider({
	value,
	children,
}: {
	value: boolean;
	children: React.ReactNode;
}) {
	return (
		<AuthAvailableContext.Provider value={value}>
			{children}
		</AuthAvailableContext.Provider>
	);
}

export function useAuthAvailable(): boolean {
	return useContext(AuthAvailableContext);
}
