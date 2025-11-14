import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "ShopVibe. - Admin",
    description: "ShopVibe. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
