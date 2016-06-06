Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class getClient
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest


        Dim db As New mbpDataContext

        Dim cid As String = context.Request.QueryString("client")

        Dim c =
            db.clients.SingleOrDefault(Function(_c) _c.CLIENTE = cid)

        Dim json As New JavaScriptSerializer
        context.Response.Write(json.Serialize(c))

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class