import { Tabs } from 'expo-router';
import { Home, LayoutDashboard, LogOut, User, List } from 'lucide-react-native';

export default function BakerLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#ea580c',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                tabBarActiveTintColor: '#ea580c',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                    headerTitle: 'Ronoos BakeHub',
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="orders/index"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color }) => <List size={24} color={color} />,
                    headerShown: true
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                    headerShown: false
                }}
            />

            {/* Hidden Routes (rendered as screens but not in tab bar) */}
            <Tabs.Screen name="products/index" options={{ href: null, title: 'Manage Products' }} />
            <Tabs.Screen name="products/new" options={{ href: null, title: 'New Product' }} />
            <Tabs.Screen name="products/[id]" options={{ href: null, title: 'Edit Product' }} />
            <Tabs.Screen name="orders/[id]" options={{ href: null, title: 'Order Details' }} />
            <Tabs.Screen name="manage-options" options={{ href: null, title: 'Manage Options' }} />
            <Tabs.Screen name="analytics" options={{ href: null, title: 'Analytics' }} />

        </Tabs>
    );
}

