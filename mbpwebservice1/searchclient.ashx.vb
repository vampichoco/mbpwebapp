Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class searchclient
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim db As New mbpDataContext

        Dim json As New JavaScriptSerializer()

        Dim q = context.Request.QueryString("c")

        Dim query = From item In db.clients Where item.NOMBRE.Contains(q) Or item.CLIENTE.Contains(q)
                    Select New With {.cliente = item.CLIENTE, .nombre = item.NOMBRE}
                    Take (5)

        context.Response.Write(json.Serialize(query))

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class