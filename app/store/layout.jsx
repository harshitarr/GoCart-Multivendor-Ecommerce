import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "ShopVibe. - Store Dashboard",
    description: "ShopVibe. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
