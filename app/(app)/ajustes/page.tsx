import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/ajustes/change-password-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const alta = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES")
    : "—";

  return (
    <>
      <AppHeader title="Ajustes" subtitle="Tu cuenta y preferencias" />
      <div className="space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tu cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user?.email ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Alta:</span> {alta}
            </p>
            <p className="break-all">
              <span className="text-muted-foreground">ID:</span> {user?.id ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Cerrar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
