Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization
Imports System.Linq.Dynamic

Public Class search
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim db As New mbpDataContext

        Dim json As New JavaScriptSerializer()

        Dim queryHelper As New mbpQuery
        queryHelper.Populate()

        'Dim queryResult As List(Of prod)

        If context.Request.QueryString("qs") Is Nothing Then
            Dim q = context.Request.QueryString("q")

            For Each item In context.Request.QueryString.AllKeys
                queryHelper.AddVariable(item, context.Request.QueryString(item))
            Next

            Dim predicate = queryHelper.Query(q)

            Dim r = db.prods.Where(predicate).Select(Function(p) New With {.ARTICULO = p.ARTICULO, .DESCRIP = p.DESCRIP, .PRECIO = p.PRECIO1}).Take(20).ToList()
            context.Response.Write(json.Serialize(r))
        Else
            Dim qs = context.Request.QueryString("qs")
            qs = HttpUtility.UrlDecode(qs)
            Dim r = db.prods.Where(qs).Select(Function(p) New With {.ARTICULO = p.ARTICULO, .DESCRIP = p.DESCRIP, .PRECIO = p.PRECIO1}).Take(20).ToList()
            context.Response.Write(json.Serialize(r))
        End If




    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class