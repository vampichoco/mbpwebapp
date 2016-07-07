Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class vends
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim db As New mbpDataContext
        Dim json As New JavaScriptSerializer

        Dim s As Boolean = Boolean.Parse(context.Request.QueryString("single"))

        If s = True Then
            Dim v As String =
                context.Request.QueryString("vend")


            Dim q = (From item In db.vends Where item.Vend = v Select New With {.Vendedor = item.Vend, .Nombre = item.Nombre}).Single

            If q IsNot Nothing Then
                Dim r = New With {.sucess = True, .data = q}
                context.Response.Write(json.Serialize(r))
            End If


        Else

            Dim q = From item In db.vends Select New With {.Vendedor = item.Vend, .Nombre = item.Nombre}
            context.Response.Write(json.Serialize(q))


        End If


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class