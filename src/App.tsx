// App.tsx
export default function App({ userRole, userName }: { userRole: string, userName: string }) {
  return (
    // Remova o basename ou use "/" para o Netlify
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* ... outras rotas */}

          {/* O painel "AdminDashboard" está aqui! */}
          <Route path="admin" element={
            <ProtectedRoute userRole={userRole} allowedRoles={["Tesoureira", "Apóstolo", "Dev"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* ... demais rotas protegidas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
